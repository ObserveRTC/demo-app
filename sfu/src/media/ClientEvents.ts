import { EventEmitter, WebSocket, RawData } from "ws";
import { 
    Message
} from "./MessageProtocol";
import { createLogger } from "../common/logger";

const logger = createLogger('ClientEvents')

type MessageEvents = {
    [E in Message as E["type"]]: E
}

export type EventsMap = MessageEvents & {
    'close': undefined,
}

export class ClientEvents {
    private _closed: boolean = false;
    private _emitter: EventEmitter = new EventEmitter();
    public constructor(
        private _ws: WebSocket
    ) {
        const messageListener = (data: RawData, isBinary: boolean) => {
            this._receive(data.toString());
        }
        
        this._ws.on('message', messageListener);
        this._ws.once('close', () => {
            if (this._closed) return;
            this.close()
        });
        
    }

    public send(message: Message): void {
        if (this._closed) {
            logger.warn(`Attempted to send a message on a closed ClientEvents`);
            return;
        }
        logger.trace(`Sending message`, message);
        const data = JSON.stringify(message);
        this._ws.send(data);
    }

    public on<K extends keyof EventsMap>(event: K, listener: (data: EventsMap[K]) => void): this {
        this._emitter.on(event, listener);
        return this;
    }

    public once<K extends keyof EventsMap>(event: K, listener: (data: EventsMap[K]) => void): this {
        this._emitter.once(event, listener);
        return this;
    }

    public off<K extends keyof EventsMap>(event: K, listener: (data: EventsMap[K]) => void): this {
        this._emitter.off(event, listener);
        return this;
    }

    public _emit<K extends keyof EventsMap>(event: K, data: EventsMap[K]): boolean {
        return this._emitter.emit(event, data);
    }


    private _receive(data: string): void {
        let message: any | undefined = undefined;
        try {
            message = JSON.parse(data);
        } catch (err) {
            logger.warn(`Cannot parse data ${data}`);
            return;
        }
        logger.trace(`Received message`, message);
        const { type: messageType }: { type: string } = message;
        if (!messageType) {
            logger.warn(`Undefined message type`);
            return;
        }
        if (0 < this._emitter.listenerCount(messageType)) {
            this._emitter.emit(messageType, message);
            return;
        }
        logger.warn(`Cannot find listener for message type: ${messageType}`);
    }


    get closed() {
        return this._closed;
    }

    async close(): Promise<void> {
        if (this._closed) {
            logger.warn(`Attempted to close comlink twice`);
            return;
        }
        this._closed = true;
        logger.info(`Closing comlink`);

        this._emit('close', undefined);
        
        for (const messageType of this._emitter.eventNames()) {
            this._emitter.removeAllListeners(messageType);
        }
        
    }
}