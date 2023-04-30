import { ObservedClientSource, Observer } from "@observertc/observer-js";
import { ServerEvents } from "../Server";
import { WebSocket, RawData } from 'ws';
import { createLogger } from "../common/logger";
import { ClientSampleDecoder } from "@observertc/samples-decoder";

const logger = createLogger('ObservedClients');

type ObservedClient = {
	clientId: string,
    source: ObservedClientSource,
	decoder: ClientSampleDecoder,
	disconnected?: number,
	webSocket?: WebSocket,
};

export type ObservedClientsConfig = {
	maxDisconnectingTimeInMs: number,
}

export class ObservedClients {
	private _clients = new Map<string, ObservedClient>();
	public constructor(
		public readonly config: ObservedClientsConfig,
		private readonly _observer: Observer,
	) {

	}

	public accept(event: ServerEvents['websocket-connection']) {
		const {
            webSocket, 
            query,
        } = event;
		const clientId = query.clientId;
		const serviceId = query.serviceId;
		const mediaUnitId = query.mediaUnitId;
		const roomId = query.roomId;
		const callId = query.callId;
		if (!clientId || !roomId || !callId) {
			webSocket.close(4001, `clientId, roomId, callId are mandatory fields in query string`);
			return;
		}

		const existingClient = this._clients.get(clientId);
		if (existingClient) {
			this._setup(existingClient, webSocket);
			logger.info(`Client ${clientId} is reconnected`);
			return;
		}

        const decoder = new ClientSampleDecoder();
        const source = this._observer.createClientSource({
            serviceId,
            mediaUnitId,
            callId,
            clientId,
            roomId,
		});
		const newClient: ObservedClient = {
			clientId,
            source,
			decoder,
		};
        this._clients.set(clientId, newClient);
		this._setup(newClient, webSocket);
        logger.info(`Client ${clientId} is added`);
	}

	public check(): void {
		const now = Date.now();
		for (const observedClient of Array.from(this._clients.values())) {
			if (observedClient.disconnected) {
				const elapsedTimeInMs = now - observedClient.disconnected;
				if (this.config.maxDisconnectingTimeInMs < elapsedTimeInMs) {
					this._remove(observedClient.clientId);
				}
				continue;
			}
		}
	}

	public clear() {
		const clientIds = Array.from(this._clients.keys());
		clientIds.forEach(clientId => this._disconnect(clientId));
		this._clients.clear();
	}

	private _disconnect(clientId: string) {
		const observedClient = this._clients.get(clientId);
		if (!observedClient) {
			logger.warn(`Cannot disconnect client ${clientId}, because it does not exist`);
			return;
		}
		if (observedClient.disconnected) {
			logger.warn(`Attempted to disconnect client ${clientId} twice`);
			return;
		}
		observedClient.disconnected = Date.now();
		logger.info(`Client ${clientId} is disconnected`);
	}

	private _remove(clientId: string) {
		const observedClient = this._clients.get(clientId);
		if (!observedClient) {
			logger.warn(`Cannot remove client ${clientId}, because it does not exist`);
			return;
		}

		this._clients.delete(clientId);
		
		const { source } = observedClient;
		if (!source.closed) {
			source.close();
		}
		logger.info(`Client ${clientId} is removed`);
	}

	private _setup(observedClient: ObservedClient, webSocket: WebSocket) {
		const { source, decoder, clientId } = observedClient;
		const messageListener = (data: RawData, isBinary: boolean) => {
            if (isBinary) {
                logger.warn(`No binary message is expected from client ${clientId}`);
            }
            const clientSampleBase64 = data.toString();
			const clientSample = decoder.decodeFromBase64(clientSampleBase64);
            source.accept(clientSample);
        };
        webSocket.once('close', () => {
			webSocket.off('message', messageListener);
			this._disconnect(clientId);
        })
		webSocket.on('message', messageListener);

		observedClient.webSocket = webSocket;
		observedClient.disconnected = undefined;
	}
}