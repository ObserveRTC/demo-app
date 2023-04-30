import { ClientSample } from "@observertc/client-monitor-js";
import { ClientSampleEncoder } from "@observertc/samples-encoder";
import { createLoggerMiddleware } from "../middlewares/loggerMiddleware";

export type ObserverServiceClientConfig = {
	wsAddress: string,
	reconnect: boolean,
}

export class ObserverServiceClient {

	private _ws?: WebSocket;
	private _connecting?: Promise<void>;
	private _closed = false;
	private _buffer: string[] = [];
	private _encoder = new ClientSampleEncoder();
	private _canConnect = true;

	public constructor(
		public readonly config: ObserverServiceClientConfig
	) {

	}

	public async connect(queryString: string): Promise<void> {
		if (this._closed) {
			throw new Error(`Attempted to execute connect() operation on a closed resource`);
		}
		console.info(`Connecting to observer`);
		if (this._connecting) {
			return this._connecting;
		}
		const wsAddress = `${this.config.wsAddress}?${queryString}`;

		this._canConnect = true;
		
        const connecting = (tried?: number) => new Promise<WebSocket>((resolve, reject) => {
            const ws = new WebSocket(wsAddress, 'client-sample');
            let reconnecting = false;
            const reconnect = (ev: Event | CloseEvent) => {
                if (reconnecting) {
                    return;
                }
                reconnecting = true;
                ws.removeEventListener("error", reconnect);
				ws.removeEventListener("close", reconnect);
				const attempt = tried ?? 0;
				if (10 < attempt) {
					reject(`Failed to connect to ${wsAddress}. The number of attempt (${attempt}) reached the configured maximum attempt`);
					return;
				}
                setTimeout(() => {
                    connecting(attempt + 1).then(resolve).catch(reject);
                }, 1000);
            }
            ws.addEventListener("error", reconnect);
            ws.addEventListener("close", reconnect);
            
            const done = () => {
                ws.removeEventListener("error", reconnect);
                ws.removeEventListener("close", reconnect);
                ws.removeEventListener("open", done);
                resolve(ws);
            };
            ws.addEventListener("open", done);
            if (ws.readyState === WebSocket.OPEN) {
                done();
                return;
            }
		});
		
        this._connecting = connecting().then(webSocket => new Promise((resolve, reject) => {
            const closeListener = (closeEvent: CloseEvent) => {
                webSocket.removeEventListener("close", closeListener);
				this._ws = undefined;
				if (!this._canConnect || this._closed) {
					return;
				}
                const selfClosed = 4000 <= closeEvent.code;
                if (!this.config.reconnect || selfClosed) {
					this.close();
                    return;
                }
                this.connect(queryString);
            }
            webSocket.addEventListener("close", closeListener);
			this._ws = webSocket;
			console.info(`Connected to observer`);
            resolve();
		}));
		this._connecting.finally(() => {
			this._connecting = undefined;
		})
		return  this._connecting;
	}

	public async disconnect(): Promise<void> {
		if (this._closed) {
			throw new Error(`Attempted to execute connect() operation on a closed resource`);
		}
		if (this._connecting) {
			await this._connecting;
		}
		this._canConnect = false;
		this._ws?.close();
	}

	public close() {
		if (this._closed) {
			return;
		}
		this._closed = true;
		(this._connecting ?? Promise.resolve()).then(() => {
			this._ws?.close();
		})
	}

	public send(clientSample: ClientSample) {
		if (this._closed) {
			throw new Error(`Cannot add clientSample to a closed resource`);
		}
		const encodedSample = this._encoder.encodeToBase64(clientSample);
		if (!this._ws) {
			this._buffer.push(encodedSample);
			return;
		}
		if (0 < this._buffer.length) {
			for (const prevEncodedSample of this._buffer) {
				this._ws.send(prevEncodedSample);
			}
			this._buffer = [];
		}
		this._ws.send(encodedSample);
	}
}