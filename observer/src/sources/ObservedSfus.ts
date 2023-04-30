import { ServerEvents } from "../Server";
import { WebSocket, RawData } from 'ws';
import { createLogger } from "../common/logger";
import { SfuSampleDecoder } from "@observertc/samples-decoder";
import { ObservedSfuSource, Observer } from "@observertc/observer-js";

const logger = createLogger('ObservedSfus');

type ObservedSfu = {
	sfuId: string,
    source: ObservedSfuSource,
	decoder: SfuSampleDecoder,
	disconnected?: number,
	webSocket?: WebSocket,
};

export type ObservedSfusConfig = {
	maxDisconnectingTimeInMs: number,
}

export class ObservedSfus {
	private _sfus = new Map<string, ObservedSfu>();
	public constructor(
		public readonly config: ObservedSfusConfig,
		private readonly _observer: Observer,
	) {

	}

	public accept(event: ServerEvents['websocket-connection']) {
		const {
            webSocket, 
            query, 
        } = event;
		
		const sfuId = query.sfuId;
		const serviceId = query.serviceId;
		const mediaUnitId = query.mediaUnitId;

		if (!sfuId) {
			webSocket.close(4001, `sfuId, is mandatory field in query string`);
			return;
		}

		const existingSfu = this._sfus.get(sfuId);
		if (existingSfu) {
			this._setup(existingSfu, webSocket);
			logger.info(`SFU ${sfuId} is reconnected`);
			return;
		}

        const decoder = new SfuSampleDecoder();
        const source = this._observer.createSfuSource({
            serviceId,
            mediaUnitId,
			sfuId,
		});
		const newSfu: ObservedSfu = {
			sfuId,
            source,
			decoder,
		};
        this._sfus.set(sfuId, newSfu);
		this._setup(newSfu, webSocket);
        logger.info(`SFU ${sfuId} is added`);
	}

	public check(): void {
		const now = Date.now();
		for (const observedSfu of Array.from(this._sfus.values())) {
			if (observedSfu.disconnected) {
				const elapsedTimeInMs = now - observedSfu.disconnected;
				if (this.config.maxDisconnectingTimeInMs < elapsedTimeInMs) {
					this._remove(observedSfu.sfuId);
				}
				continue;
			}
		}
	}

	public clear() {
		const sfuIds = Array.from(this._sfus.keys());
		sfuIds.forEach(sfuId => this._disconnect(sfuId));
		this._sfus.clear();
	}

	private _disconnect(SfuId: string) {
		const observedSfu = this._sfus.get(SfuId);
		if (!observedSfu) {
			logger.warn(`Cannot disconnect Sfu ${SfuId}, because it does not exist`);
			return;
		}
		if (observedSfu.disconnected) {
			logger.warn(`Attempted to disconnect Sfu ${SfuId} twice`);
			return;
		}
		observedSfu.disconnected = Date.now();
		observedSfu.webSocket = undefined;
		logger.info(`SFU ${SfuId} is disconnected`);
	}

	private _remove(sfuId: string) {
		const observedSfu = this._sfus.get(sfuId);
		if (!observedSfu) {
			logger.warn(`Cannot remove SFU ${sfuId}, because it does not exist`);
			return;
		}

		this._sfus.delete(sfuId);
		
		const { source } = observedSfu;
		if (!source.closed) {
			source.close();
		}
		logger.info(`SFU ${sfuId} is removed`);
	}

	private _setup(observedSfu: ObservedSfu, webSocket: WebSocket) {
		const { source, decoder, sfuId } = observedSfu;
		const messageListener = (data: RawData, isBinary: boolean) => {
            if (isBinary) {
                logger.warn(`No binary message is expected from SFU ${sfuId}`);
            }
            const SfuSampleBase64 = data.toString();
            const sfuSample = decoder.decodeFromBase64(SfuSampleBase64);
            source.accept(sfuSample);
        };
        webSocket.once('close', () => {
			webSocket.off('message', messageListener);
			this._disconnect(sfuId);
        })
		webSocket.on('message', messageListener);

		observedSfu.webSocket = webSocket;
		observedSfu.disconnected = undefined;
	}
}