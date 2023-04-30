import { Server } from "./Server";
import process from'process';
import { createLogger, LogLevel, setLogLevel } from "./common/logger";
import { argv, help, loadConfig } from './appconfig';
import { createObserver } from "@observertc/observer-js";
import Prometheus from 'prom-client';
import { createSfuEvaluator } from "./evaluators/sfuEvaluator";
import { createCommonEvaluator } from "./evaluators/commonEvaluator";
import { createTurnEvaluator } from "./evaluators/turnEvaluator";
import { createCallsEvaluator } from "./evaluators/callsEvaluator";
import { ObservedClients } from "./sources/ObservedClients";
import { ObservedSfus } from "./sources/ObservedSfus";
import { createMySink } from "./sinks/mySink";
import { createProcessor } from "./common/Middleware";
import { createIndexController } from "./controllers/IndexController";
import { createPromController } from "./controllers/promController";

const logger = createLogger('main');

async function main(): Promise<void> {
    if (argv["help"] || argv["h"]) {
        console.log(help());
        process.exit(1);
    }
    const config = await loadConfig();

    setLogLevel(config.logLevel as LogLevel);

    logger.info("Loaded config", JSON.stringify(config, null, 2));
    
    // create an observer to accept and process samples from media components (webapp, or SFU)
    const observer = createObserver({
        defaultServiceId: 'observertc',
        defaultMediaUnitId: 'demo-app',
        evaluator: {
            fetchSamples: true,
        },
        logLevel: 'debug',
    });

    const server = new Server(config);
    const promRegistry = new Prometheus.Registry();
    const observedClients = new ObservedClients({
            maxDisconnectingTimeInMs: 5000,
        }, observer
    );
    const observedSfus = new ObservedSfus({
            maxDisconnectingTimeInMs: 5000,
        }, observer
    );

    server.on('websocket-connection', (event) => {
        const { webSocket } = event;
        switch (webSocket.protocol) {
            case 'client-sample':
                observedClients.accept(event)
                break;
            case 'sfu-sample':
                observedSfus.accept(event);
                break;
            default:
                webSocket.close(4001, `Unrecognized protocol ${webSocket.protocol}`);
                break;
        }
    });

    // add http(s) endpoint 
    server.processor = createProcessor(
        createIndexController(),
        createPromController(promRegistry),

        // if a request ends up here it was not processed anywhere
        async ({ request }) => {
            logger.warn(`Request to endpoint ${request.url} has not been processed`);
        }
    );

    // add an evaluator process to the observer automatically called
    // when the observer state changes
    observer.addEvaluators(
        createCommonEvaluator(promRegistry),
        createCallsEvaluator(promRegistry),
        createTurnEvaluator(promRegistry),
        createSfuEvaluator(promRegistry),

        async () => {
            // execute some arbitrary 'callback' task after all evaluation is done
        }
    );

    // add your database sink to save observer created reports
    observer.addSinks(
        createMySink()
    );

    let stopped = false;
    process.on('SIGINT', async () => {
        if (!stopped) {
            server.stop();
            stopped = true;
        }
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

main()
    .then(() => {
        
    })
    .catch(err => {
        logger.error(err);
    });