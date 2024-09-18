"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
const process_1 = __importDefault(require("process"));
const logger_1 = require("./common/logger");
const config_1 = require("./config");
const CreateTransportRequestListener_1 = require("./listeners/CreateTransportRequestListener");
const MediasoupService_1 = require("./services/MediasoupService");
const ControlProducerNotificationListener_1 = require("./listeners/ControlProducerNotificationListener");
const ControlConsumerNotificationListener_1 = require("./listeners/ControlConsumerNotificationListener");
const CreateProducerRequestListener_1 = require("./listeners/CreateProducerRequestListener");
const observer_js_1 = require("@observertc/observer-js");
const JoinCallRequestListener_1 = require("./listeners/JoinCallRequestListener");
const ControlTransportNotificationListener_1 = require("./listeners/ControlTransportNotificationListener");
const ConnectTransportRequestListener_1 = require("./listeners/ConnectTransportRequestListener");
const samples_decoder_1 = require("@observertc/samples-decoder");
const ClientMonitorSampleNotificationListener_1 = require("./listeners/ClientMonitorSampleNotificationListener");
const ObserverRequestListener_1 = require("./listeners/ObserverRequestListener");
const MainEmitter_1 = require("./common/MainEmitter");
const logger = (0, logger_1.createLogger)('main');
const clients = new Map();
const server = new Server_1.Server(config_1.config.server);
const mediasoupService = new MediasoupService_1.MediasoupService(config_1.config.mediasoup);
const mainEmitter = new MainEmitter_1.MainEmitter();
const observer = (0, observer_js_1.createObserver)({
    maxCollectingTimeInMs: 1000,
    maxReports: 100,
    defaultMediaUnitId: 'webapp',
    defaultServiceId: 'demo-service',
});
const listeners = new Map()
    .set('join-call-request', (0, JoinCallRequestListener_1.createJoinCallRequestListener)({
    mediasoupService,
    clients,
}))
    .set('connect-transport-request', (0, ConnectTransportRequestListener_1.createConnectTransportRequestListener)({
    mediasoupService,
    clients,
}))
    .set('control-consumer-notification', (0, ControlConsumerNotificationListener_1.createControlConsumerNotificationListener)({
    clients,
    mediasoupService,
}))
    .set('control-producer-notification', (0, ControlProducerNotificationListener_1.createControlProducerNotificationListener)({
    clients,
    mediasoupService,
}))
    .set('control-transport-notification', (0, ControlTransportNotificationListener_1.createControlTransportNotificationListener)({
    clients,
    mediasoupService,
}))
    .set('create-producer-request', (0, CreateProducerRequestListener_1.createCreateProducerRequestListener)({
    clients,
    mediasoupService,
}))
    .set('create-transport-request', (0, CreateTransportRequestListener_1.createCreateTransportRequestListener)({
    mediasoupService,
    server,
    clients,
}))
    .set('client-monitor-sample-notification', (0, ClientMonitorSampleNotificationListener_1.createClientMonitorSampleNotificatinListener)({
    observer,
    clients,
    mainEmitter,
}))
    .set('observer-request', (0, ObserverRequestListener_1.createObserverRequestListener)({
    observer,
    clients,
}));
// observer.on('newcall', call => {
//     call.on('newclient', client => {
//         client.on('score', score => {
//             logger.info(`Client ${client.clientId} score: ${score}`);
//         });
//     })
// })
server
    .on('newclient', client => {
    client.webSocket.once('close', () => {
        client.sndTransport?.close();
        client.rcvTransport?.close();
        clients.delete(client.clientId);
        logger.info(`Client disconnected with id ${client.clientId}`);
    });
    let decoder;
    switch (client.schemaVersion) {
        case samples_decoder_1.schemaVersion:
            decoder = new samples_decoder_1.ClientSampleDecoder();
            logger.debug(`Client ${client.clientId} uses schema version ${client.schemaVersion}`);
            break;
        default: {
            logger.warn(`Unsupported schema version ${client.schemaVersion}`);
        }
    }
    client.decoder = decoder;
    clients.set(client.clientId, client);
    logger.info(`New client connected with id ${client.clientId}`);
})
    .on('newmessage', messageContext => {
    const listener = listeners.get(messageContext.message.type);
    if (!listener) {
        logger.warn(`No listener found for message type ${messageContext.message.type}`);
        return;
    }
    listener(messageContext)?.catch(err => {
        logger.error(`Error occurred while processing message`, err);
    });
});
async function main() {
    let stopped = false;
    process_1.default.on('SIGINT', async () => {
        if (stopped)
            return;
        stopped = true;
        logger.info("Stopping server");
        await Promise.allSettled([
            server.stop(),
            mediasoupService.stop(),
        ]);
        process_1.default.exit(0);
    });
    logger.info("Loaded config %s", (0, config_1.getConfigString)());
    try {
        require('./appendixes').run(mainEmitter);
        // do stuff
    }
    catch (ex) {
        logger.warn("Error loading module %o", ex);
    }
    await mediasoupService.start();
    await server.start();
}
main();
