import { EventEmitter } from 'events';
import { Device } from 'mediasoup-client';
import { Consumer, ConsumerOptions } from 'mediasoup-client/lib/Consumer';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { v4 as uuid } from 'uuid';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { 
	ClientMessage, 
	NotificationMap, 
	ObservedGetOngoingCallResponse, 
	ObserverGetCallStatsResponse, 
	ObserverRequest, 
	RequestMap 
} from './MessageProtocol';
import { 
	ClientSampleEncoder, 
	schemaVersion 
} from '@observertc/samples-encoder';
import { 
	ClientMonitor, 
	ClientMonitorConfig, 
	createClientMonitor 
} from '@observertc/client-monitor-js';

const logger = console;

export type ConnectionConfig = {
	clientId: string;
	serverUri: string;
	requestTimeoutInMs: number;
	monitor: ClientMonitorConfig;
	callId?: string;
	forceRelay?: boolean;
}

export type ConnectionEventMap = {
	'join': [],
	'error': [string],
	'close': [],
	'newconsumer': [Consumer]
}

type ConsumerAppData = {
	clientId: string,
	userId: string,
	producerPaused: boolean,
}

export declare interface Connection {
	// eslint-disable-next-line no-unused-vars
	on<U extends keyof ConnectionEventMap>(event: U, listener: (...args: ConnectionEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	off<U extends keyof ConnectionEventMap>(event: U, listener: (...args: ConnectionEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	once<U extends keyof ConnectionEventMap>(event: U, listener: (...args: ConnectionEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	emit<U extends keyof ConnectionEventMap>(event: U, ...args: ConnectionEventMap[U]): boolean;

}
// eslint-disable-next-line no-unused-vars
type PendingRequest = { resolve: (payload: any) => void, reject: (error: string) => void, timer: ReturnType<typeof setTimeout> }
// eslint-disable-next-line no-redeclare
export class Connection extends EventEmitter {
	// eslint-disable-next-line no-unused-vars
	private readonly _pendingRequests = new Map<string, PendingRequest>();
	public readonly mediaProducers = new Map<string, Producer>();
	public readonly mediaConsumers = new Map<string, Consumer<ConsumerAppData>>();
	private _closed = false;
	private _device?: Device;
	private _websocket?: WebSocket;
	public sndTransport?: Transport;
	public rcvTransport?: Transport;
	public readonly monitor: ClientMonitor;
	private readonly _encoder: ClientSampleEncoder;

	public constructor(
		public readonly config: ConnectionConfig
	) {
		super();
		this.monitor = createClientMonitor(config.monitor);
		this._encoder = new ClientSampleEncoder();

		this._onNewProducer = this._onNewProducer.bind(this);
	}

	// here for checking compatibility with client lib, no other use
	// private _deviceMonitor?: MediasoupStatsCollectorDeviceInterface

	public async join() {
		if (!this._device) {
			this._device = new Device();
			// const deviceMonitor = this.monitor.collectors.addMediasoupDevice(this._device);
			this.monitor.collectors.addMediasoupDevice(this._device);
			this.monitor.on('sample-created', ({ clientSample }) => {
				const sample = this._encoder.encodeToBase64(clientSample);
				this._notify('client-monitor-sample-notification', { 
					sample });
			});

			// this._deviceMonitor = deviceMonitor;
		}

		if (!this._websocket) {
			await new Promise<void>((resolve, reject) => {
				this._websocket = new WebSocket(
					`${this.config.serverUri}?${[
						['schemaVersion', schemaVersion],
						['clientId', this.config.clientId],
					].map(i => `${i[0]}=${i[1]}`).join('&')}`
				);
				this._websocket.onerror = () => reject('Failed to connect to the server');
				this._websocket.onclose = () => this.close();
				this._websocket.onmessage = (event) => this._receiveMessage(event.data).catch(err => this.emit('error', err));
				if (this._websocket.readyState === WebSocket.OPEN) resolve();
				else this._websocket.onopen = () => resolve();
			});
		}

		this.sndTransport?.close();
		this.rcvTransport?.close();

		const { 
			iceServers,
			callId, 
			rtpCapabilities: routerRtpCapabilities 
		} = await this._request('join-call-request', {
			callId: this.config.callId,
		});
		
		if (!this.config.callId) {
			if (!callId) throw new Error('Call ID is not provided');
			this.config.callId = callId;
			
			logger.debug(`Call ID is ${callId}`);

		} else if (this.config.callId && callId !== this.config.callId) {
			throw new Error(`Call ID mismatch. Expected ${this.config.callId}, got ${callId}`);
		}
		
		await this._device.load({ routerRtpCapabilities });
		this.sndTransport = await this._createTransportProcess('createSendTransport', routerRtpCapabilities, iceServers);
		this.rcvTransport = await this._createTransportProcess('createRecvTransport', routerRtpCapabilities, iceServers);

		this.emit('join');
	}

	public get callId() {
		return this.config.callId;
	}

	public get closed() {
		return this._closed;
	}

	public close() {
		if (this._closed) return;
		this._closed = true;

		this.monitor.close();
		this.sndTransport?.close();
		this.rcvTransport?.close();
		this._websocket?.close();
		this.emit('close');
	}

	public async getCallStats(callId: string) {
		return this._request('observer-request', {
			operation: {
				type: 'getCallStats',
				payload: {
					callId,
				},
			} as ObserverRequest['operation'],
		}) as Promise<ObserverGetCallStatsResponse>;
	}

	public async getOngoingCalls() {
		return this._request('observer-request', {
			operation: {
				type: 'getOngoingCalls',
				payload: {},
			} as ObserverRequest['operation'],
		}) as Promise<ObservedGetOngoingCallResponse>;
	}

	private async _receiveMessage(data: string) {
		const message = JSON.parse(data) as ClientMessage;
		try {
			switch (message.type) {
			case 'consumer-created-notification': {
				await this._createMediaConsumer({
					rtpParameters: message.rtpParameters,
					producerId: message.remoteProducerId,
					appData: {
						clientId: message.remoteClient.clientId,
						userId: message.remoteClient.userId,
						producerPaused: false,
					},
					kind: message.kind,
					id: message.consumerId,

				});
				break;
			}
			case 'control-consumer-notification': {
				const consumer = this.mediaConsumers.get(message.consumerId);
				if (!consumer) return;
				else if (message.action === 'producerPaused') consumer.appData.producerPaused = true;
				else if (message.action === 'producerResume') consumer.appData.producerPaused = false;
				else consumer[message.action]();
				break;
			}
			case 'control-producer-notification': {
				this.mediaProducers.get(message.producerId)?.[message.action]();
				break;
			}
			case 'response': {
				const request = this._pendingRequests.get(message.requestId);
				if (!request) return;
				this._pendingRequests.delete(message.requestId);
				clearTimeout(request.timer);
				if (message.error) request.reject(message.error);
				else request.resolve(message.payload);
				break;
			}
			}
		} catch (err) {
			this.emit('error', `Error while processing message: ${err}`);
		}
	}

	private async _request<K extends keyof RequestMap>(type: K, payload: Omit<RequestMap[K]['request'], 'requestId' | 'type'>): Promise<RequestMap[K]['response']> {
		const requestId = uuid();
		const request = { ...payload, requestId, type };

		return new Promise<RequestMap[K]['response']>((resolve, reject) => {
			const timer = setTimeout(() => {
				this._pendingRequests.delete(requestId);
				logger.warn(`Request ${requestId} for ${type} is timed out`);
				reject(`Request ${requestId} for ${type} is timed out`);
			}, this.config.requestTimeoutInMs);
			this._pendingRequests.set(requestId, { resolve, reject, timer });
			this._websocket!.send(JSON.stringify(request));
		});
	}

	private _notify<K extends keyof NotificationMap>(type: K, payload: Omit<NotificationMap[K], 'type'>) {
		this._websocket!.send(JSON.stringify({ type, ...payload }));
	}

	// eslint-disable-next-line no-unused-vars
	private async _createTransportProcess(method: 'createSendTransport' | 'createRecvTransport', capabilities: RtpCapabilities, iceServers: RTCIceServer[]): Promise<Transport> {
		if (!this._device) throw new Error('Device is not initialized');

		const transportOptions = await this._request('create-transport-request', { 
			role: method === 'createSendTransport' ? 'producing' : 'consuming'
		});

		if (!transportOptions) throw new Error('_join(): No TransportParameters received');
	
		const transport = this._device[method]({ 
			...transportOptions, 
			iceServers: undefined, 
			iceTransportPolicy: this.config.forceRelay ? 'relay' : 'all' 
		});
	
	
		// this._deviceMonitor?.addTransport(transport);

		transport.on('connect', ({ dtlsParameters }, callback, errback) => {
			this._request('connect-transport-request', { transportId: transport.id, dtlsParameters })
				.then(callback)
				.catch(err => {
					this.emit('error', err);
					errback(err);
				});
		});

		transport.observer.once('close', () => {
			transport.observer.off('newproducer', this._onNewProducer);

			this._notify('control-transport-notification', { 
				transportId: transport.id,
				action: 'close',
			});
		});

		transport.observer.on('newproducer', this._onNewProducer);
	
		if (method === 'createSendTransport') {
			transport.on('produce', ({ kind, rtpParameters, appData}, successCb, errCb) => {
				appData;
				this._request('create-producer-request', {
					kind,
					rtpParameters,
				})
					.then(({ producerId }) => successCb({ id: producerId }))
					.catch(err => {
						errCb(err);
						this.emit('error', err);
					});

			});
			// transport.on('producedata', produceDataListener);
	
			transport.observer.once('close', () => {
				transport.observer.removeAllListeners();
			});
		}
	
		logger.info('Transport for ', method, 'is created', transport.id);
	
		return transport;
	}

	private async _createMediaConsumer(options: ConsumerOptions<ConsumerAppData>) {
		if (!this.rcvTransport) return logger.warn('Receive transport is not ready to consume');

		const consumer = await this.rcvTransport.consume<ConsumerAppData>(options);
		const onPaused = () => this._notify('control-consumer-notification', { 
			consumerId: consumer.id,
			action: 'pause',
		});
		const onResume = () =>{
			console.warn('resume');
			this._notify('control-consumer-notification', { 
				consumerId: consumer.id,
				action: 'resume',
			});
		};

		consumer.observer.once('close', () => {
			consumer.observer.off('pause', onPaused);
			consumer.observer.off('resume', onResume);
			this.mediaConsumers.delete(consumer.id);

			logger.info(`Consumer ${consumer.id}, kind: ${consumer.kind} closed`);
		});
		consumer.observer.on('pause', onPaused);
		consumer.observer.on('resume', onResume);
		onResume();
		this.mediaConsumers.set(consumer.id, consumer);
		this.emit('newconsumer', consumer);
	}

	private _onNewProducer(producer: Producer) {
		const onPause = () => this._notify('control-producer-notification', {
			producerId: producer.id,
			action: 'pause',
		});
		const onResume = () => this._notify('control-producer-notification', {
			producerId: producer.id,
			action: 'resume',
		});

		producer.observer.once('close', () => {
			producer.observer.off('pause', onPause);
			producer.observer.off('resume', onResume);
			this.mediaProducers.delete(producer.id);

			this._notify('control-producer-notification', {
				producerId: producer.id,
				action: 'close',
			});
		});
		producer.observer.on('pause', onPause);
		producer.observer.on('resume', onResume);
		this.mediaProducers.set(producer.id, producer);
	}


}