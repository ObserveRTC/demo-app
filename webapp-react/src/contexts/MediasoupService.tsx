import { ClientMonitor } from "@observertc/client-monitor-js";
import { Device, MediaKind, ProducerOptions, RtpParameters, Transport, Producer, Consumer } from "mediasoup-client/lib/types";
import { EventEmitter } from "events";
import { ServerConnection } from "./ServerConnection";
import { v4 as uuid } from 'uuid';
import { 
	ClientRtpCapabilitiesNotification,
	CreateProducerRequest, 
	CreateProducerResponse, 
	CreateTransportRequest, 
	CreateTransportResponse, 
	GetRouterCapabilitiesRequest, 
	GetRouterCapabilitiesResponse, 
	JoinCallRequest, 
	JoinCallResponse, 
	TransportConnectedNotification 
} from '../utils/MessageProtocol';
import { createLogger } from "../utils/logger";
import { MediaService, MediaServiceEvents } from "./MediaService";

const logger = createLogger('MediasoupService');

export class MediasoupService implements MediaService {
	private _sndTransport?: Transport;
	private _rcvTransport?: Transport;
	private _emitter = new EventEmitter();
	private _producers = new Map<string, Producer>();
	private _consumers = new Map<string, Consumer>();

	public constructor(
		private _serverConnection: ServerConnection,
		private readonly _device: Device,
		public readonly monitor: ClientMonitor,
	) {
		this._serverConnection.on('consumer-created-notification', async event => {
			logger.info(`Consumer Created Event is emitted`, event);
			if (!this._rcvTransport) {
				logger.error(`Cannot consume, becasue the rcv transport does not exists`);
				return;
			}
			const consumer = await this._rcvTransport.consume({
				id: event.consumerId,
				kind: event.kind,
				rtpParameters: event.rtpParameters,
				producerId: event.remoteProducerId,
				appData: event.remoteClient,
			});
			logger.info(`Media Consumer is created consuming ${consumer.kind} from client ${event.remoteClient.clientId}, userId: ${event.remoteClient.userId}`);
			consumer.observer.once('close', () => {
				this._consumers.delete(consumer.id);
			})
			this._consumers.set(consumer.id, consumer);
			this._emit('addedMediaConsumer', {
				remoteClientId: event.remoteClient.clientId,
				userId: event.remoteClient.userId,
				track: consumer.track,
			});
		});
		this._serverConnection.on('consumer-closed-notification', event => {
			const { consumerId } = event;
			const consumer = this._consumers.get(consumerId);
			if (consumer) {
				this._emit('removedMediaConsumer', {
					trackId: consumer.track.id
				});
			}
			
		});
	}

	private async _createTransport(role: 'producing' | 'consuming'): Promise<Transport> {
		const transportOptions = await this._serverConnection.request<CreateTransportResponse>(new CreateTransportRequest(
			uuid(),
			role,
		  ));
		  const method = role === "producing" ? "createSendTransport" : "createRecvTransport";
		  const transport = this._device[method](transportOptions);
	  
		  transport.on("connect", ({ dtlsParameters }, callback) => {
			this._serverConnection.sendMessage(new TransportConnectedNotification(
			  uuid(),
			  role,
			  dtlsParameters
			));
			callback();
		  });
	  
		  if (role === "producing") {
			const produceListener = async ({ kind, rtpParameters }: { kind: MediaKind, rtpParameters: RtpParameters, appData: any}, callback: (params: { id: string}) => void, errback: (error: Error) => void) => {
			  const response = await this._serverConnection.request<CreateProducerResponse>(new CreateProducerRequest(
				uuid(),
				kind,
				rtpParameters,
				"userId"
			  ))
			  const { producerId: id } = response;
			  callback({ id });
			};
			transport.on("produce", produceListener);
			transport.observer.once("close", () => {
				transport.off("produce", produceListener);
			});
		}
		return transport;
	}

	public async connect(): Promise<void> {
		logger.info(`Connecting to mediasoup service`);
		await this._serverConnection.connect();

		logger.info(`Load Device`);
		const { rtpCapabilities } = await this._serverConnection.request<GetRouterCapabilitiesResponse>(new GetRouterCapabilitiesRequest(uuid()))
	
		await this._device.load({ 
			routerRtpCapabilities: rtpCapabilities
		});
	
		logger.info(`Create Transports`);

		this._serverConnection.sendMessage(new ClientRtpCapabilitiesNotification(this._device.rtpCapabilities));
		const [ sndTransport, rcvTransport ] = await Promise.all([
			this._createTransport('producing'),
			this._createTransport('consuming'),
		]);
		this._sndTransport = sndTransport;
		this._rcvTransport = rcvTransport;
		
		const joined = await this._serverConnection.request<JoinCallResponse>(new JoinCallRequest(uuid()));
		
		logger.info(`Created sndTransport, and rcvTransport`);
	}


	public async produceMedia(track: MediaStreamTrack): Promise<void> {
		if (!this._sndTransport) {
			throw new Error(`Cannot produce track without a sending transport`);
		}
		const options: ProducerOptions = {
			track
		};
		const producer = await this._sndTransport.produce(options);
		logger.info(`Producer is created. id: ${producer.id}, kind: ${producer.kind}`);
		producer.observer.once('close', () => {
			this._producers.delete(producer.id);
			logger.info(`Producer is deleted. id: ${producer.id}, kind: ${producer.kind}`);
		});
		this._producers.set(producer.id, producer);
	}

	private _findMediaObjectByTrack(track: MediaStreamTrack): Producer | Consumer | undefined {
		for (const producer of Array.from(this._producers.values())) {
			if (producer.track?.id === track.id) return producer;
		}
		for (const consumer of Array.from(this._consumers.values())) {
			if (consumer.track.id === track.id) return consumer;
		}
	}

	public pauseMedia(track: MediaStreamTrack): void {
		const mediaObj = this._findMediaObjectByTrack(track);
		if (!mediaObj) {
			logger.warn(`Cannot find produced or consumed media for track ${track.id}`);
			return;
		}
		if (mediaObj.paused) {
			logger.warn(`Attempted to pause an already paused track ${track.id}`);
			return;
		}
		mediaObj.pause();
	}

	public resumeMedia(track: MediaStreamTrack): void {
		const mediaObj = this._findMediaObjectByTrack(track);
		if (!mediaObj) {
			logger.warn(`Cannot find produced or consumed media for track ${track.id}`);
			return;
		}
		if (!mediaObj.paused) {
			logger.warn(`Attempted to resume an already played track ${track.id}`);
			return;
		}
		mediaObj.resume();
	}

	public on<K extends keyof MediaServiceEvents>(event: K, listener: (data: MediaServiceEvents[K]) => void): this {
		this._emitter.on(event, listener);
		return this;
	}
	
	public once<K extends keyof MediaServiceEvents>(event: K, listener: (data: MediaServiceEvents[K]) => void): this {
		this._emitter.once(event, listener);
		return this;
	}
	
	public off<K extends keyof MediaServiceEvents>(event: K, listener: (data: MediaServiceEvents[K]) => void): this {
		this._emitter.off(event, listener);
		return this;
	}

	public _emit<K extends keyof MediaServiceEvents>(event: K, data: MediaServiceEvents[K]): boolean {
		return this._emitter.emit(event, data);
	}
	
}