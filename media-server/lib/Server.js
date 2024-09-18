"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http = __importStar(require("http"));
const ws_1 = require("ws");
const logger_1 = require("./common/logger");
const url_1 = __importDefault(require("url"));
const events_1 = require("events");
const logger = (0, logger_1.createLogger)('Server');
class Server extends events_1.EventEmitter {
    config;
    _state = 'idle';
    _httpServer;
    _wsServer;
    constructor(config) {
        super();
        this.config = config;
    }
    async start() {
        if (this._state !== 'idle') {
            logger.warn(`Attempted to start a server in ${this._state} state. It must be in 'idle' state to perform start.`);
            return;
        }
        this._setState('started');
        logger.info(`The server is being started, state is: ${this._state}`);
        this._httpServer = await this._makeHttpServer();
        this._wsServer = await this._makeWsServer(this._httpServer);
        await new Promise(resolve => {
            this._httpServer.listen(this.config.port, () => {
                logger.info(`Listening on ${this.config.port}`);
                resolve();
            });
        });
        this._setState('run');
    }
    async stop() {
        if (this._state !== 'run') {
            logger.warn(`Attempted to stop a server in ${this._state} state. It must be in 'run' state to perform stop.`);
            return;
        }
        this._setState('stopped');
        if (this._wsServer) {
            await new Promise(resolve => {
                this._wsServer.close(err => {
                    if (err) {
                        logger.warn(`Error while stopping websocket server`, err);
                    }
                    resolve();
                });
            });
        }
        if (this._httpServer) {
            await new Promise(resolve => {
                this._httpServer.close(err => {
                    if (err) {
                        logger.warn(`Error while stopping http server server`, err);
                    }
                    resolve();
                });
            });
        }
        this._setState('idle');
    }
    _setState(value) {
        const prevState = this._state;
        this._state = value;
        logger.info(`State changed from ${prevState} to ${this._state}`);
    }
    get state() {
        return this._state;
    }
    async _makeHttpServer() {
        const result = http.createServer({
            maxHeaderSize: 8192,
            insecureHTTPParser: false,
        });
        result.on('request', (request, response) => {
            const requestContext = {
                request,
                response,
            };
            this.emit('httprequest', requestContext);
        });
        result.once("error", err => {
            logger.error(`Server encountered an error %o`, err);
        });
        return result;
    }
    async _makeWsServer(httpServer) {
        const wsServer = new ws_1.WebSocketServer({
            server: httpServer,
        });
        wsServer.on('connection', async (ws, req) => {
            // console.warn("\n\n", url.parse(req.url, true).query, "\n\n");
            const query = url_1.default.parse(req.url ?? '', true).query;
            const clientId = query.clientId;
            const schemaVersion = query.schemaVersion;
            const send = (message) => {
                const data = JSON.stringify(message);
                ws.send(data);
            };
            const clientContext = {
                userId: query.userId,
                clientId,
                schemaVersion,
                webSocket: ws,
                send,
                mediaProducers: new Set(),
                mediaConsumers: new Set(),
            };
            this.emit('newclient', clientContext);
            ws.on('message', data => {
                const message = JSON.parse(data.toString());
                const messageContext = {
                    clientId,
                    message,
                    send,
                    get callId() {
                        return clientContext.routerId;
                    },
                };
                this.emit('newmessage', messageContext);
            });
            logger.info(`Websocket connection is requested from ${req.socket.remoteAddress}, query:`, query);
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
exports.Server = Server;
