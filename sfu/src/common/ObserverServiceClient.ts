import { SfuSample } from "@observertc/sfu-monitor-js";
import { SfuSampleEncoder } from "@observertc/samples-encoder";
import { WebSocket } from 'ws';

export type ObserverServiceClientConfig = {
	wsAddress: string,
	reconnect: boolean,
}

export class ObserverServiceClient {

	private _ws?: WebSocket;
	private _connecting?: Promise<void>;
	private _closed = false;
	private _buffer: string[] = [];
	private _encoder = new SfuSampleEncoder();
	private _canConnect = true;

	public constructor(
		public readonly config: ObserverServiceClientConfig
	) {

	}

	public async connect(queryString: string): Promise<void> {
		if (this._closed) {
			throw new Error(`Attempted to execute connect() operation on a closed resource`);
		}
		if (this._connecting) {
			return this._connecting;
		}
		const wsAddress = `${this.config.wsAddress}?${queryString}`;

		this._canConnect = true;
		
        const connecting = (tried?: number) => new Promise<WebSocket>((resolve, reject) => {
            const ws = new WebSocket(wsAddress, 'sfu-sample');
            let reconnecting = false;
            const reconnect = (ev: Event | CloseEvent) => {
                if (reconnecting) {
                    return;
                }
				reconnecting = true;
				ws.off('error', reconnect);
				ws.off('close', reconnect);
				const attempt = tried ?? 0;
				if (2 < attempt) {
					reject(`Failed to connect to ${wsAddress}. The number of attempt (${attempt}) reached the configured maximum attempt`);
					return;
				}
                setTimeout(() => {
                    connecting(attempt + 1).then(resolve).catch(reject);
                }, 1000);
            }
            ws.off("error", reconnect);
            ws.off("close", reconnect);
            
            const done = () => {
                ws.off("error", reconnect);
                ws.off("close", reconnect);
                ws.off("open", done);
                resolve(ws);
            };
            ws.once("open", done);
            if (ws.readyState === WebSocket.OPEN) {
                done();
                return;
            }
		});
		
        this._connecting = connecting().then(webSocket => new Promise((resolve, reject) => {
            const closeListener = (closeEvent: CloseEvent) => {
                webSocket.off("close", closeListener);
				this._ws = undefined;
				if (!this._canConnect || !this._closed) {
					return;
				}
                const selfClosed = 4000 <= closeEvent.code;
                if (!this.config.reconnect || selfClosed) {
					this.close();
                    return;
                }
                this.connect(queryString);
            }
            webSocket.off("close", closeListener);
			this._ws = webSocket;
            resolve();
		}));
		return this._connecting;
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

	public send(sfuSample: SfuSample) {
		if (this._closed) {
			throw new Error(`Cannot add clientSample to a closed resource`);
		}
		const encodedSample = this._encoder.encodeToBase64(sfuSample);
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