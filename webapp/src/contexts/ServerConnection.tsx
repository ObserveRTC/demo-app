import { EventEmitter } from "events"
import { createLogger } from "../utils/logger";
import { Message, Response, Request } from "../utils/MessageProtocol";

const logger = createLogger('ServerConnection');

type MessageEvents = {
    [E in Message as E["type"]]: E
}

export type ServerConnectionConfig = {
	url: string,
	maxRetry: number,
	maxBufferTimeInMs: number,
	maxBufferSize: number,
	retryingPaceTimeInMs: number,
	resendPaceInMs: number,
	clientId: string,
	roomId: string,
}

export class ServerConnection {
	private _emitter = new EventEmitter();
	private _ws?: WebSocket;
	private _connecting?: Promise<void>;
	private _requests = new Map<string, (response: any) => void>();
	private _timer?: ReturnType<typeof setTimeout>;
	private _buffer: {message: Message, timestamp: number}[] = [];

	public constructor(
		public readonly config: ServerConnectionConfig
	) {

		const resolveRequest = (response: Response) => {
			const request = this._requests.get(response.requestId);
			if (!request) {
			  logger.warn(`Client does not have a pending request for ${response.requestId}, type: ${response.type}`);
			  return;
			}
			request(response);
		  };

		  this
			.on('get-client-stats-response', resolveRequest)
			.on('create-producer-response', resolveRequest)
			.on('get-router-capabilities-response', resolveRequest)
			.on('pause-producer-response', resolveRequest)
			.on('create-transport-response', resolveRequest)
			.on('join-call-response', resolveRequest)
	  
	}

	public async connect(): Promise<void> {
		logger.info(`Connecting to ${this.config.url}`);
		if (this._ws) {
			logger.warn(`Attempted to connect to an already established websocket connection`);
			return;
		}
		if (this._connecting) {
			return this._connecting;
		}
		
		const connecting = (url: string, retried = 0) => new Promise<WebSocket>((resolve, reject) => {
			new Promise<WebSocket>((onopen, onerror) => {
				const ws = new WebSocket(url);
				if (ws.readyState === WebSocket.OPEN) {
					onopen(ws);
					return;
				}
				ws.onopen = () => onopen(ws);
				ws.onerror = (err) => onerror(err);
			}).then((ws) => {
				logger.info(`Connection established to ${url}`);
				resolve(ws);
			}).catch(err => {
				if (0 < this.config.maxRetry && this.config.maxRetry < retried) {
					reject(`Cannot establish connection to ${url}, maxretry reached.`);
					return;
				}
				logger.info(`Connection failed, retried: ${retried}`);
				setTimeout(() => connecting(url, retried + 1).then(resolve), this.config.retryingPaceTimeInMs);
			});
		});
		this._connecting = connecting(this.config.url).then(ws => {
			logger.info(`Connected to ${this.config.url}`);
			ws.onmessage = ev => {
				const obj = JSON.parse(ev.data);
				const { type }: { type: string } = obj;
				logger.debug(`Message ${obj} received`);
				if (this._emitter.listenerCount(type) < 1) {
					logger.warn(`No listener registered for message type ${type}`);
					return;
				}
				this._emitter.emit(type, obj);
			};
			this._ws = ws;
			this._connecting = undefined;
		});
	}

	public on<K extends keyof MessageEvents>(event: K, listener: (data: MessageEvents[K]) => void): this {
		this._emitter.on(event, listener);
		return this;
	}

	public off<K extends keyof MessageEvents>(event: K, listener: (data: MessageEvents[K]) => void): this {
		this._emitter.off(event, listener);
		return this;
	}

	public once<K extends keyof MessageEvents>(event: K, listener: (data: MessageEvents[K]) => void): this {
		this._emitter.once(event, listener);
		return this;
	}

	public sendMessage(message: Message) {
		if (!this._ws) {
			if (this.config.maxBufferSize < 0 || this._buffer.length < this.config.maxBufferSize) {
				this._buffer.push({
					message,
					timestamp: Date.now(),
				})
			}
			if (!this._timer) {
				const createTimer = () => setTimeout(() => {
					if (!this._ws) {
						this._timer = createTimer();
						return;
					}
					const now = Date.now();
					const buffer = this._buffer;
					this._buffer = [];
					for (const { message, timestamp } of buffer) {
						if (0 < this.config.maxBufferTimeInMs && this.config.maxBufferTimeInMs < now - timestamp) {
							continue;
						}
						this.sendMessage(message);
					}
				}, this.config.resendPaceInMs);
				this._timer = createTimer();
			}
			return;
		}
		const data = JSON.stringify(message);
		this._ws.send(data);
	}

	public request<T extends Response>(request: Request) {
		return new Promise<T>((resolve, reject) => {
			this._requests.set(request.requestId, resolve);
			this.sendMessage(request);
		});
	}
}