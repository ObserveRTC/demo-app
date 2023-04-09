import * as http from 'http';
import { WebSocketServer, WebSocket, EventEmitter } from 'ws';
import { createLogger } from "./logger";
import url from 'url';

const logger = createLogger('Server');

export type ServerConfig = {
    serverIp: string,
    hostname: string,
    port: number,
    rtcMinPort: number,
    rtcMaxPort: number,
    announcedIp: string,
}

export type ServerState = 'idle' | 'started' | 'run' | 'stopped' | 'aborted';

export interface ServerEvents {
    httpRequest: {
        request: http.IncomingMessage,
        response: http.ServerResponse<http.IncomingMessage> & {
            req: http.IncomingMessage;
        },
    },
    stateChange: {
        prevState: ServerState,
        newState: ServerState,
    },
    wsConnection: {
        webSocket: WebSocket,
        query: any,
    }
}

export class Server {
    private _emitter = new EventEmitter();
    private _state: ServerState = 'idle';
    private _httpServer?: http.Server;
    private _wsServer?: WebSocketServer;

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
        this._emit('stateChange', {
            prevState,
            newState: this._state,
        });
    }

    public get state() {
        return this._state;
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
            this._emit('httpRequest', {
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
            this._emit('wsConnection', {
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