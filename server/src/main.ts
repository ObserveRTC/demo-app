import { Server } from "./Server";
import process from'process';
import { createLogger, LogLevel, setLogLevel } from "./logger";
import { argv, help, loadConfig } from './appconfig';
import * as mediasoup from 'mediasoup';
import { MediasoupRooms, WorkerAppData } from "./MediasoupRooms";
import { createObserver } from "@observertc/observer-js";
import Prometheus from 'prom-client';
import { ClientContext } from "./MediasoupRoom";
import { createExports } from "./exports";
import { createSfuMonitor } from '@observertc/sfu-monitor-js';
import { v4 as uuid } from 'uuid';
import { createSfuEvaluator } from "./evaluators/sfuEvaluator";
import { SfuSampleEncoder } from "@observertc/samples-encoder";
import { SfuSampleDecoder } from "@observertc/samples-decoder";
import { createCommonEvaluator } from "./evaluators/commonEvaluator";
import { createTurnEvaluator } from "./evaluators/turnEvaluator";

const logger = createLogger('main');

const { sfuMonitor, mediasoupCollector } = createSfuMonitorAndMediasoupCollector(mediasoup);


async function main(): Promise<void> {
    if (argv["help"] || argv["h"]) {
        console.log(help());
        process.exit(1);
    }
    const config = await loadConfig();
    const server = new Server(config);
    const workerAppdata: WorkerAppData = {
        ip: config.serverIp,
        announcedIp: config.announcedIp,
    };
    const worker = await mediasoup.createWorker({
        logLevel: 'warn',
        rtcMinPort: config.rtcMinPort,
        rtcMaxPort: config.rtcMaxPort,
        appData: workerAppdata,
    });

    // create an observer to accept and process samples from media components (webapp, or SFU)
    const observer = createObserver({
        defaultServiceId: 'observertc',
        defaultMediaUnitId: 'demo-app',
        evaluator: {
            fetchSamples: true,
        },
        logLevel: 'debug',
    });

    // add SFU to the observer
    const sfuSource = observer.createSfuSource({
        sfuId: uuid(),
        mediaUnitId: 'demo-sfu',
    })
    // sfu-sample-encoder and decoder are added here for demonstration purposes
    const sfuSampleEncoder = new SfuSampleEncoder();
    const sfuSampleDecoder = new SfuSampleDecoder();
    sfuMonitor.on('sample-created', ({ sfuSample }) => {
        const encodedSfuSample = sfuSampleEncoder.encodeToUint8Array(sfuSample);
        const decodedSfuSample = sfuSampleDecoder.decodeFromBytes(encodedSfuSample);
        // logger.info("decodedSfuSample", decodedSfuSample);
        sfuSource.accept(decodedSfuSample);
    });

    const rooms = new MediasoupRooms(
        worker,
        observer
    );
    const promRegistry = new Prometheus.Registry();

    setLogLevel(config.logLevel as LogLevel);

    logger.info("Loaded config", JSON.stringify(config, null, 2));

    server.on('httpRequest', ({ request, response}) => {
        const parts = request!.url!.split("/");
        const resource = parts.length < 2 ? undefined : parts[1];
        if (resource === "metrics") {
            promRegistry.metrics().then(data => {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(data);
            })
        } else {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({
                notImplemented: true,
            }));
        }
    })
    .on('stateChange', ({ prevState, newState }) => {
        logger.info(`State of the server is changed from ${prevState} to ${newState}`);
    })
    .on('wsConnection', ({ webSocket, query }) => {
        const roomId = query.roomId;
        const clientId = query.clientId;
        const userId = query.userId;
        if (!roomId || !clientId) {
            logger.warn(`No roomId or clientId was provided in websocket query string`);
            return;
        }
        // webSocket.onmessage = (data) => {
        //     logger.debug(`Received message 2`, data);
        // }
        rooms.getOrCreateRoom(roomId).then(room => {

            // add client to the observer
            const clientSource = observer.createClientSource({
                clientId,
                userId,
                mediaUnitId: 'demo-webapp',
                roomId,
                callId: room.callId
            });
            webSocket.once('close', () => clientSource.close());


            const clientContext: ClientContext = {
                clientId,
                userId,
                webSocket,
                clientSource,
            }
            room.add(clientContext);
        })
    });

    // add an evaluator process to the observer automatically called
    // when the observer state changes
    observer.addEvaluators(
        createCommonEvaluator(promRegistry),
        createSfuEvaluator(promRegistry),
        createTurnEvaluator(promRegistry),
        createSfuEvaluator(promRegistry),
        async () => {
            // execute some arbitrary 'callback' task as all evaluation is ended
        }
    );


    // create export processes subscribe the observer created reports
    createExports(observer);


    process.on('SIGINT', async () => {
        server.stop();
        mediasoupCollector.close();
        setTimeout(() => {
            // if (!server.closed) {
                // logger.info("Timeout elapsed, process exit");
            // }
            process.exit(0);
        }, 3000);
        // await throttle.stop();
    });
    await server.start().catch(async err => {
        logger.error(`Error occurred while peer sfu communication is being established`, err);
    });

}

export function createSfuMonitorAndMediasoupCollector(mediasoup: any) {

	const sfuMonitor = createSfuMonitor({
        logLevel: 'info',
        collectingPeriodInMs: 5000,
        samplingPeriodInMs: 15000,
    });
    
    const mediasoupCollector = sfuMonitor.createMediasoupCollector({
        mediasoup,
        pollConsumerStats: () => true,
        pollDataConsumerStats: () => true,
        pollProducerStats: () => true,
        pollDataProducerStats: () => true,
        pollWebRtcTransportStats: () => true,
    });

    sfuMonitor.on('stats-collected', () => {
        // logger.info("here", sfuMonitor.storage);
        // const storageDump = sfuMonitor.storage.dump(true);
        // logger.info(storageDump);
    });
    
    return { sfuMonitor, mediasoupCollector };
}



main()
    .then(() => {
        
    })
    .catch(err => {
        logger.error(err);
    });