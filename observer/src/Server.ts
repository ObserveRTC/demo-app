import * as http from 'http';
import { WebSocketServer, WebSocket, EventEmitter } from 'ws';
import { createLogger } from "./common/logger";
import url from 'url';
import { Processor } from './common/Middleware';

const logger = createLogger('Server');

export type ServerConfig = {
    port: number,
}

export type ServerState = 'idle' | 'started' | 'run' | 'stopped' | 'aborted';

export type ServerHttpRequest = {
    request: http.IncomingMessage,
    response: http.ServerResponse<http.IncomingMessage> & {
        req: http.IncomingMessage;
    },
}

export interface ServerEvents {
    'websocket-connection': {
        webSocket: WebSocket,
        query: any,
    }
}

export class Server {
    private _emitter = new EventEmitter();
    private _state: ServerState = 'idle';
    private _httpServer?: http.Server;
    private _wsServer?: WebSocketServer;
    private _processor?: Processor<ServerHttpRequest> | undefined;
    
    public constructor(
        public readonly config: ServerConfig,
    ) {
        
    }

    public async start(): Promise<void> {
        if (this._state !== 'idle') {
            logger.warn(`Attempted to start a server in ${this._state} state. It must be in 'idle' state to perform start.`);
            return;
        }
        this._setState('started');
        logger.info(`The server is being started, state is: ${this._state}`);
        this._httpServer = await this._makeHttpServer();
        this._wsServer = await this._makeWsServer(this._httpServer!);
        await new Promise<void>(resolve => {
            this._httpServer!.listen(this.config.port, () => {
                logger.info(`Listening on ${this.config.port}`);
                resolve();
            });
        });

        this._setState('run');
    }

    public async stop(): Promise<void> {
        if (this._state !== 'run') {
            logger.warn(`Attempted to stop a server in ${this._state} state. It must be in 'run' state to perform stop.`);
            return;
        }
        this._setState('stopped');
        if (this._wsServer) {
            await new Promise<void>(resolve => {
                this._wsServer!.close(err => {
                    if (err) {
                        logger.warn(`Error while stopping websocket server`, err);
                    }
                    resolve();
                });
            });
        }
        if (this._httpServer) {
            await new Promise<void>(resolve => {
                this._httpServer!.close(err => {
                    if (err) {
                        logger.warn(`Error while stopping http server server`, err);
                    }
                    resolve();
                });
            });
        }
        this._setState('idle');
    }

    private _setState(value: ServerState): void {
        const prevState = this._state;
        this._state = value;
        logger.info(`State changed from ${prevState} to ${this._state}`);
    }

    public get state() {
        return this._state;
    }

    public set processor(value: Processor<ServerHttpRequest> | undefined) {
        if (value === undefined) {
            this._processor = undefined;
            return;
        }
        if (this._processor) {
            throw new Error(`Cannot assign processor twice`);
        }
        this._processor = value;
    }

    public get processor(): Processor<ServerHttpRequest> | undefined {
        return this._processor;
    }

    public on<K extends keyof ServerEvents>(event: K, listener: (data: ServerEvents[K]) => void): this {
        this._emitter.on(event, listener);
        return this;
    }

    public once<K extends keyof ServerEvents>(event: K, listener: (data: ServerEvents[K]) => void): this {
        this._emitter.once(event, listener);
        return this;
    }

    public off<K extends keyof ServerEvents>(event: K, listener: (data: ServerEvents[K]) => void): this {
        this._emitter.off(event, listener);
        return this;
    }

    public _emit<K extends keyof ServerEvents>(event: K, data: ServerEvents[K]): boolean {
        return this._emitter.emit(event, data);
    }


    private async _makeHttpServer(): Promise<http.Server> {
        const result = http.createServer({
                maxHeaderSize: 8192,
                insecureHTTPParser: false,
            }
        );
        result.on('request', (request, response) => {
            if (!this._processor) {
                logger.warn(`Cannot process http request, becasue no processor is assigned to the Server`, request);
                return;
            }
            this._processor({
                request,
                response
            })
        });
        result.once("error", err => {
            logger.error(`Server encountered an error`, err);
        });
        return result;
    }

    private async _makeWsServer(httpServer?: http.Server): Promise<WebSocketServer> {
        const wsServer = new WebSocketServer({
            server: httpServer,
        });

        wsServer.on('connection', async (ws, req) => {
            // console.warn("\n\n", url.parse(req.url, true).query, "\n\n");
            const query = url.parse(req.url ?? '', true).query;
            logger.info(`Websocket connection is requested from ${req.socket.remoteAddress}, query:`, query);
            this._emit('websocket-connection', {
                webSocket: ws,
                query,
            });
        });
        wsServer.on('error', error => {
            logger.warn("Error occurred on websocket server", error);
        });
        wsServer.on('headers', obj => {
            logger.info("Headers on websocket server", obj);
        });
        wsServer.on('close', () => {
            logger.info("Websocket connection is closed");
        });
        return wsServer;
    }
}