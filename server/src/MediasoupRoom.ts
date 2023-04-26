import { ClientEvents } from "./ClientEvents"
import { WebSocket } from "ws";
import * as mediasoup from 'mediasoup';
import { ObservedClientSource, Observer } from "@observertc/observer-js";
import { GetRouterCapabilitiesResponse, CreateProducerResponse, CreateTransportResponse, PauseProducerResponse, ConsumerCreatedNotification, JoinCallResponse, ConsumerClosedNotification } from "./MessageProtocol";
import { createLogger } from "./logger";
import { RtpCapabilities } from "mediasoup/node/lib/types";
import { ClientSampleDecoder } from "@observertc/samples-decoder";

const logger = createLogger('Room');

export type ClientContext = {
	webSocket: WebSocket,
	clientId: string,
	userId: string,
	clientSource: ObservedClientSource,
}

export type EventsMap = {
    'close': undefined,
}

type Client = {
	clientId: string,
	userId: string,
	clientEvents: ClientEvents,
	rtpCapabilities?: RtpCapabilities,
	sndTransport?: mediasoup.types.WebRtcTransport,
	rcvTransport?: mediasoup.types.WebRtcTransport,
	producers: Map<string, mediasoup.types.Producer>,
	consumers: Map<string, mediasoup.types.Consumer>,
	clientSampleDecoder: ClientSampleDecoder,
}

export type RoomConfig = {
	ip: string,
	announcedIp: string,
	roomId: string,
}

export abstract class MediasoupRoom {

	private _clients = new Map<string, Client>();
	public constructor(
		public readonly config: RoomConfig,
		private readonly _router: mediasoup.types.Router,
		private readonly _observer: Observer,
	) {
		this._router.observer.once('close', () => this.close());
	}

	public get roomId() {
		return this.config.roomId;
	}

	public get callId() {
		return this._router.id;
	}

	public add(clientContext: ClientContext) {
		const { clientId, userId, clientSource } = clientContext;
	
		const producers = new Map<string, mediasoup.types.Producer>();
		const consumers = new Map<string, mediasoup.types.Consumer>();
		const events = new ClientEvents(clientContext.webSocket)
		const client: Client = {
			clientId,
			userId,
			clientEvents: events,
			producers,
			consumers,
			clientSampleDecoder: new ClientSampleDecoder(),
		};
		
		logger.info(`Add client ${clientId}, ${userId}`);

		events.on('get-router-capabilities-request', ({ requestId }) => {
			const rtpCapabilities = this._router.rtpCapabilities;
			events.send(new GetRouterCapabilitiesResponse(
				requestId,
				rtpCapabilities
			));
		})
		.on('client-rtp-capabilities', ({ rtpCapabilities }) => {
			client.rtpCapabilities = rtpCapabilities;
		})
		.on('create-transport-request', async ({ requestId, role }) => {
			if (
				(role === 'producing' && client.sndTransport) || 
				(role === 'consuming' && client.rcvTransport)
			) {
				logger.warn(`Attempted to create ${role} transport for client ${clientId}, userId: ${userId} in room ${this.roomId} twice`);
				return;
			}
			const transportOptions: mediasoup.types.WebRtcTransportOptions = {
				listenIps: [{
					ip: this.config.ip,
					announcedIp: this.config.announcedIp,
				}],
			};
			const transport = await this._router.createWebRtcTransport(transportOptions);
			if (role === 'producing') {
				client.sndTransport = transport;
			} else if (role === 'consuming') {
				client.rcvTransport = transport;
			}
			events.send(new CreateTransportResponse(
				requestId,
				transport.id,
				transport.iceParameters,
				transport.iceCandidates,
				transport.dtlsParameters
			));
		})
		.on('join-call-request', async ({ requestId }) => {
			// consume all other participant
			logger.info(`Consuming transport is connected for client ${clientId}`);
			for (const producingClientId of this._clients.keys()) {
				if (clientId === producingClientId) continue;
				await this._consumeClient(producingClientId, client.clientId);
			}
			events.send(new JoinCallResponse(
				requestId,
				this.callId,
			));
		})
		.on('transport-connected-notification', async ({ role, dtlsParameters }) => {
			const transport = role === 'consuming'
				? client.rcvTransport
				: client.sndTransport;
			if (!transport) {
				logger.warn(`Attempted to connect a non-existing ${role} transport for client ${clientId}, userId: ${userId} in room ${this.roomId}.`);
				return;
			}
			const connected = await transport.connect({ dtlsParameters })
				.then(() => true)
				.catch(err => {
					logger.error(`Error occurred whiole trying to connect a transport`, err);
					return false;
				});
			if (!connected) {
				return;
			}
			if (role === 'producing') {
				return;
			}
		})
		.on('create-producer-request', async ({ requestId, kind, rtpParameters, userId }) => {
			const transport = client.sndTransport;
			if (!transport) {
				logger.error(`Attempted to produce a non-existing transport`);
				return;
			}
			const options: mediasoup.types.ProducerOptions = {
				kind,
				rtpParameters,
			}
			const producer = await transport.produce(options).catch(err => {
				logger.warn(`Cannot create a producer`, err);
				return undefined;
			});
			if (!producer) {
				return;
			}
			producer.observer.once('close', () => {
				logger.info(`Removed producer ${producer.id}, client: ${clientId}`);
				producers.delete(producer.id);
			})
			producers.set(producer.id, producer);
			events.send(new CreateProducerResponse(
				requestId,
				producer.id
			));
			logger.info(`Created producer ${producer.id}, client: ${clientId} should be consumed by other clients`);
			for (const consumingClientId of this._clients.keys()) {
				if (clientId === consumingClientId) continue;
				await this._consumeClient(client.clientId, consumingClientId);
			}
		})
		.on('pause-producer-request', async ({ requestId, producerId}) => {
			const producer = producers.get(producerId);
			if (!producer) {
				return;
			}
			await producer.pause().catch(err => {
				logger.error(`Error occurred while pausing a producer`, err);
			});
			events.send(new PauseProducerResponse(
				requestId
			));
		})
		.on('resume-producer-request', async ({ requestId, producerId }) => {
			const producer = producers.get(producerId);
			if (!producer) {
				return;
			}
			await producer.resume().catch(err => {
				logger.error(`Error occurred while resuming a producer`, err);
			});
			events.send(new PauseProducerResponse(
				requestId
			));
		})
		.on('get-client-stats-request', async ({ requestId, remoteClientId }) => {
			if (!this._clients.has(remoteClientId)) {
				return;
			}

			// const client = await this._observer.getClient(remoteClientId);
			
			const observedClient = await this._observer.getClient(remoteClientId);
			if (!observedClient) {
				return;
			}
			
			const peerConnections = await this._observer.getAllPeerConnections(observedClient.peerConnectionIds)
			const outboundTrackIds = Array.from(peerConnections.values()).flatMap(pc => pc.outboundTrackIds);
			const outboundTracks = await this._observer.getAllOutboundTracks(outboundTrackIds);
			for (const outboundTrack of outboundTracks.values()) {
				if (outboundTrack.kind === 'audio') {
					
				}
			}
		})
		.on('observed-sample-notification', ({ clientSample: base64Str }) => {
			const clientSample = client.clientSampleDecoder.decodeFromBase64(base64Str);
			clientSource.accept(clientSample);
		})
		.once('close', () => {
			logger.info(`Closing client ${clientId}`);
			client.sndTransport?.close();
			client.rcvTransport?.close();
			this._clients.delete(clientId);
			if (this._clients.size < 1) {
				this.close();
			}
		})
		this._clients.set(clientId, client);
	}

	public close() {
		if (this._router.closed) {
			return;
		}
		this._router.close();
		this.onClosed();
	}

	private async _consumeClient(producingClientId: string, consumingClientId: string): Promise<void> {
		const producingClient = this._clients.get(producingClientId);
		const consumingClient = this._clients.get(consumingClientId);
		logger.info(`Attempt to consume from client ${producingClientId} to client ${consumingClientId}`);

		if (!producingClient || !consumingClient) {
			logger.warn(`Producing (${!!producingClient}) or consumingclient (${!!consumingClient}) was not found`);
			return;
		}
		for (const producer of producingClient.producers.values()) {
			let consumed = false;
			for (const consumer of consumingClient.consumers.values()) {
				if (consumer.producerId === producer.id) {
					consumed = true;
					break;
				}
			}
			if (consumed) {
				logger.debug(`Producer ${producer.id} on client ${consumingClientId} from client ${producingClientId} is already consumed`);
				continue;
			}

			// consume this producer
			
			const rtpCapabilities = consumingClient.rtpCapabilities;
			if (!rtpCapabilities) {
				logger.warn(`No rtpCapabilities is set for consumingClient`);
				continue;
			}
			const { id: producerId } = producer;

			const consumingTransport = consumingClient.rcvTransport;
			if (!consumingTransport) {
				logger.warn(`No consumingTransport is set for consumingClient`);
				continue;
			}
			
			const consumer = await consumingTransport.consume({
				producerId,
				rtpCapabilities,
				paused: false,
			});
			logger.info(`Created consumer for ${consumingClientId} consuming producer ${producerId}`);
			consumer.observer.once('close', () => {
				logger.info(`Removed consumer ${consumer.id}, client: ${consumingClientId}`);
				consumingClient.consumers.delete(consumer.id);
				if (!consumingClient.clientEvents.closed) {
					consumingClient.clientEvents.send(new ConsumerClosedNotification(consumer.id))
				}
			})
			consumingClient.consumers.set(consumer.id, consumer);
			consumingClient.clientEvents.send(new ConsumerCreatedNotification(
				consumer.id,
				producer.id,
				consumer.kind,
				consumer.rtpParameters, {
					userId: producingClient.userId,
					clientId: producingClientId,
				}
			));
		}
	}

	protected abstract onClosed(): void;
}