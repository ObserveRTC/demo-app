import { Server } from "./Server";
import process from'process';
import { createLogger, LogLevel, setLogLevel } from "./common/logger";
import { argv, help, loadConfig } from './appconfig';
import * as mediasoup from 'mediasoup';
import { MediasoupRooms, WorkerAppData } from "./media/Rooms";
import { ClientContext } from "./media/Room";
import { createSfuMonitor } from '@observertc/sfu-monitor-js';
import { SfuSampleEncoder } from "@observertc/samples-encoder";
import { createProcessor } from "./common/Middleware";
import { createIndexController } from "./controllers/IndexController";
import { ObserverServiceClient } from "./common/ObserverServiceClient";

const logger = createLogger('main');

const { sfuMonitor, mediasoupCollector } = createSfuMonitorAndMediasoupCollector(mediasoup);


async function main(): Promise<void> {
    if (argv["help"] || argv["h"]) {
        console.log(help());
        process.exit(1);
    }
    const config = await loadConfig();

    setLogLevel(config.logLevel as LogLevel);

    logger.info("Loaded config", JSON.stringify(config, null, 2));

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


    // sfu-sample-encoder and decoder are added here for demonstration purposes
    const observerClient = new ObserverServiceClient({
        wsAddress: 'ws://localhost:7080',
        reconnect: true,
    });
    const queryString = Object.entries({
		sfuId: sfuMonitor.sfuId,
	}).reduce(
		(str, [key, val]) => `${str}&${key}=${val}`,
		''
	);
    observerClient.connect(queryString).then(() => {
        logger.info(`Connected to Observer`);
    });
    sfuMonitor.on('sample-created', ({ sfuSample }) => {
        observerClient.send(sfuSample);
    });

    const rooms = new MediasoupRooms(
        worker,
    );

    server.processor = createProcessor(
        createIndexController(),

        // if a request ends up here it was not processed anywhere
        async ({ request }) => {
            logger.warn(`Request to endpoint ${request.url} has not been processed`);
        }
    )

    server.on('websocket-connection', ({ webSocket, query }) => {
        const roomId = query.roomId;
        const clientId = query.clientId;
        const userId = query.userId;
        if (!roomId || !clientId) {
            webSocket.close(4001, `No roomId or clientId was provided in websocket query string`)
            return;
        }
        // webSocket.onmessage = (data) => {
        //     logger.debug(`Received message 2`, data);
        // }
        rooms.getOrCreateRoom(roomId).then(room => {
            const clientContext: ClientContext = {
                clientId,
                userId,
                webSocket,
            }
            room.add(clientContext);
        })
    });


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
        createSfuEvents: true,
    });
    
    const mediasoupCollector = sfuMonitor.createMediasoupCollector({
        mediasoup,
        // pollConsumerStats: () => true,
        // pollDataConsumerStats: () => true,
        // pollProducerStats: () => Math.random() < 0.1,
        // pollDataProducerStats: () => true,
        // pollWebRtcTransportStats: () => true,
    });

    

    sfuMonitor.on('stats-collected', () => {
        for (const inboundRtpPad of sfuMonitor.storage.inboundRtpPads()) {
            
        }
        // logger.info("here", sfuMonitor.storage);
        // const storageDump = sfuMonitor.storage.dump(true);
        // logger.info(storageDump);
    });
    for (const transport of sfuMonitor.storage.transports()) {
        if (transport.internal === false) {
            Array.from(transport.inboundRtpPads()).length
        }
    }
    
    return { sfuMonitor, mediasoupCollector };
}



main()
    .then(() => {
        
    })
    .catch(err => {
        logger.error(err);
    });