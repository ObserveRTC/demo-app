import * as http from 'http';
import { ClientContext } from './common/ClientContext';
import { ClientMessageContext } from './listeners/ClientMessageListener';
import { EventEmitter } from 'events';
export type ServerConfig = {
    port: number;
    serverIp: string;
    announcedIp?: string;
};
export type ServerState = 'idle' | 'started' | 'run' | 'stopped' | 'aborted';
export type ServerHttpRequest = {
    request: http.IncomingMessage;
    response: http.ServerResponse<http.IncomingMessage> & {
        req: http.IncomingMessage;
    };
};
export interface ServerEvents {
    newclient: [ClientContext];
    newmessage: [ClientMessageContext];
    httprequest: [ServerHttpRequest];
}
export declare interface Server {
    on<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
    once<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
    off<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
    emit<U extends keyof ServerEvents>(event: U, ...args: ServerEvents[U]): boolean;
}
export declare class Server extends EventEmitter {
    readonly config: ServerConfig;
    private _state;
    private _httpServer?;
    private _wsServer?;
    constructor(config: ServerConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private _setState;
    get state(): ServerState;
    private _makeHttpServer;
    private _makeWsServer;
}
//# sourceMappingURL=Server.d.ts.map