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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediasoupService = void 0;
const mediasoup = __importStar(require("mediasoup"));
const logger_1 = require("../common/logger");
const MessageProtocol_1 = require("../protocols/MessageProtocol");
const logger = (0, logger_1.createLogger)('MediasoupService');
class MediasoupService {
    config;
    _run = false;
    _worker;
    routers = new Map();
    transports = new Map();
    mediaProducers = new Map();
    mediaConsumers = new Map();
    dataProducers = new Map();
    dataConsumers = new Map();
    constructor(config) {
        this.config = config;
    }
    async start() {
        if (this._run)
            return;
        this._run = true;
        const worker = await mediasoup.createWorker(this.config.workerSettings);
        worker.once('died', () => {
            this._worker = undefined;
        });
        this._worker = worker;
    }
    async stop() {
        if (!this._run)
            return;
        this._run = false;
        this._worker?.close();
    }
    async getOrCreateRouter(routerId) {
        if (!this._worker)
            throw new Error('Worker is not started');
        let router = this.routers.get(routerId || '');
        if (router)
            return router;
        router = await this._worker.createRouter({
            mediaCodecs: this.config.mediaCodecs,
        });
        const addTransport = (transport) => this._addTransport(router, transport);
        router.observer.once('close', () => {
            router.observer.off('newtransport', addTransport);
            this.routers.delete(router.id);
            logger.info(`Router ${router.id} closed`);
        });
        router.observer.on('newtransport', addTransport);
        this.routers.set(router.id, router);
        logger.info(`Router ${router.id} created`);
        return router;
    }
    async consumeMediaProducer(producerId, consumingClient) {
        const mediaProducer = this.mediaProducers.get(producerId);
        logger.info(`Attempt to consume media producer ${mediaProducer?.id} to client ${consumingClient.clientId}`);
        if (!mediaProducer || !consumingClient) {
            throw new Error(`Media producer ${producerId} or consuming client ${consumingClient.clientId} not found`);
        }
        else if (consumingClient.rcvTransport === undefined) {
            throw new Error(`Client ${consumingClient.clientId} has no receiving transport`);
        }
        const router = this.routers.get(mediaProducer.appData.routerId);
        if (!router) {
            throw new Error(`Router ${mediaProducer.appData.routerId} not found`);
        }
        const consumer = await consumingClient.rcvTransport.consume({
            producerId: mediaProducer.id,
            rtpCapabilities: router.rtpCapabilities,
            paused: mediaProducer.kind === 'video',
            appData: {
                remoteClosed: false,
            }
        });
        const onProducerPause = () => consumingClient.send(new MessageProtocol_1.ControlConsumerNotification(consumer.id, 'producerPaused'));
        const onProducerResume = () => consumingClient.send(new MessageProtocol_1.ControlConsumerNotification(consumer.id, 'producerResume'));
        consumer.observer.once('close', () => {
            mediaProducer.observer.off('pause', onProducerPause);
            mediaProducer.observer.off('resume', onProducerResume);
            consumingClient.mediaConsumers.delete(consumer.id);
            if (!consumer.appData.remoteClosed) {
                consumingClient.send(new MessageProtocol_1.ControlConsumerNotification(consumer.id, 'close'));
            }
        });
        mediaProducer.observer.on('pause', onProducerPause);
        mediaProducer.observer.on('resume', onProducerResume);
        consumingClient.mediaConsumers.add(consumer.id);
        return consumer;
    }
    ;
    _addTransport = (router, transport) => {
        const addProducer = (producer) => this._addProducer(router, transport, producer);
        const addConsumer = (consumer) => this._addConsumer(router, transport, consumer);
        const addDataProducer = (dataProducer) => this._addDataProducer(router, transport, dataProducer);
        const addDataConsumer = (dataConsumer) => this._addDataConsumer(router, transport, dataConsumer);
        transport.observer.once('close', () => {
            transport.observer.off('newproducer', addProducer);
            transport.observer.off('newconsumer', addConsumer);
            transport.observer.off('newdataproducer', addDataProducer);
            transport.observer.off('newdataconsumer', addDataConsumer);
            this.transports.delete(transport.id);
            logger.info(`Transport ${transport.id} closed on router ${router.id}. the number of transports is ${this.transports.size}`);
            if (this.transports.size === 0) {
                router.close();
            }
        });
        transport.observer.on('newproducer', addProducer);
        transport.observer.on('newconsumer', addConsumer);
        transport.observer.on('newdataproducer', addDataProducer);
        transport.observer.on('newdataconsumer', addDataConsumer);
        this.transports.set(transport.id, transport);
        logger.info(`Transport ${transport.id} created on router ${router.id}`);
    };
    _addProducer = (router, transport, producer) => {
        producer.observer.once('close', () => {
            this.mediaProducers.delete(producer.id);
            logger.info(`Producer ${producer.id} closed on transport ${transport.id} on router ${router.id}`);
        });
        producer.appData.routerId = router.id;
        producer.appData.transportId = transport.id;
        producer.appData.remoteClosed = false;
        this.mediaProducers.set(producer.id, producer);
        logger.info(`Producer ${producer.id} created on transport ${transport.id} on router ${router.id}`);
    };
    _addConsumer = (router, transport, consumer) => {
        consumer.observer.once('close', () => {
            this.mediaConsumers.delete(consumer.id);
            logger.info(`Consumer ${consumer.id} closed on transport ${transport.id} on router ${router.id}`);
        });
        this.mediaConsumers.set(consumer.id, consumer);
        logger.info(`Consumer ${consumer.id} created on transport ${transport.id} on router ${router.id}`);
    };
    _addDataProducer = (router, transport, dataProducer) => {
        dataProducer.observer.once('close', () => {
            this.dataProducers.delete(dataProducer.id);
            logger.info(`Data producer ${dataProducer.id} closed on transport ${transport.id} on router ${router.id}`);
        });
        this.dataProducers.set(dataProducer.id, dataProducer);
        logger.info(`Data producer ${dataProducer.id} created on transport ${transport.id} on router ${router.id}`);
    };
    _addDataConsumer = (router, transport, dataConsumer) => {
        dataConsumer.observer.once('close', () => {
            this.dataConsumers.delete(dataConsumer.id);
            logger.info(`Data consumer ${dataConsumer.id} closed on transport ${transport.id} on router ${router.id}`);
        });
        this.dataConsumers.set(dataConsumer.id, dataConsumer);
        logger.info(`Data consumer ${dataConsumer.id} created on transport ${transport.id} on router ${router.id}`);
    };
}
exports.MediasoupService = MediasoupService;
