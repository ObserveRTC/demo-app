import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { 
	ClientMessage,
	NotificationMap, 
	ObservedGetOngoingCallResponse, 
	ObserverGetCallStatsResponse, 
	ObserverRequest, 
	RequestMap 
} from './MessageProtocol';

const logger = console;

export type ObserverClientConfig = {
	clientId: string;
	serverUri: string;
	requestTimeoutInMs: number;
}

export type ObserverClientEventMap = {
	'error': [string],
	'close': [],
}

export declare interface ObserverClient {
	// eslint-disable-next-line no-unused-vars
	on<U extends keyof ObserverClientEventMap>(event: U, listener: (...args: ObserverClientEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	off<U extends keyof ObserverClientEventMap>(event: U, listener: (...args: ObserverClientEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	once<U extends keyof ObserverClientEventMap>(event: U, listener: (...args: ObserverClientEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	emit<U extends keyof ObserverClientEventMap>(event: U, ...args: ObserverClientEventMap[U]): boolean;

}
// eslint-disable-next-line no-unused-vars
type PendingRequest = { resolve: (payload: any) => void, reject: (error: string) => void, timer: ReturnType<typeof setTimeout> }
// eslint-disable-next-line no-redeclare
export class ObserverClient extends EventEmitter {
	// eslint-disable-next-line no-unused-vars
	private readonly _pendingRequests = new Map<string, PendingRequest>();
	private _closed = false;
	private _websocket?: WebSocket;

	public constructor(
		public readonly config: ObserverClientConfig,
	) {
		super();
		config;
	}

	// here for checking compatibility with client lib, no other use
	// private _deviceMonitor?: MediasoupStatsCollectorDeviceInterface

	public async connect() {
		if (!this._websocket) {
			await new Promise<void>((resolve, reject) => {
				this._websocket = new WebSocket(
					`${this.config.serverUri}?${[
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
	}

	public get closed() {
		return this._closed;
	}

	public close() {
		if (this._closed) return;
		this._closed = true;
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
			case 'response': {
				const request = this._pendingRequests.get(message.requestId);
				if (!request) return;
				this._pendingRequests.delete(message.requestId);
				clearTimeout(request.timer);
				if (message.error) request.reject(message.error);
				else request.resolve(message.payload);
				break;
			}
			default: {
				logger.warn(`Unknown message type: ${message.type}`);
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
}