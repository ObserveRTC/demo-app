import * as mediasoup from 'mediasoup';
import { createLogger } from '../common/logger';
import { ClientContext } from '../common/ClientContext';
import { ControlConsumerNotification } from '../protocols/MessageProtocol';

const logger = createLogger('MediasoupService');

export type MediasoupServiceConfig = {
	numberOfWorkers: number;
	workerSettings: mediasoup.types.WorkerSettings;
	mediaCodecs: mediasoup.types.RtpCodecCapability[];
}

type ProducerAppData = {
	routerId: string;
	transportId: string;
	remoteClosed?: boolean;
}	

type ConsumerAppData = {
	remoteClosed?: boolean;
}

export class MediasoupService {
	private _run = false;
	public readonly workers = new Map<number, mediasoup.types.Worker>();
	public readonly routers = new Map<string, mediasoup.types.Router>();
	public readonly transports = new Map<string, mediasoup.types.Transport>();
	public readonly mediaProducers = new Map<string, mediasoup.types.Producer<ProducerAppData>>();
	public readonly mediaConsumers = new Map<string, mediasoup.types.Consumer<ConsumerAppData>>();
	public readonly dataProducers = new Map<string, mediasoup.types.DataProducer>();
	public readonly dataConsumers = new Map<string, mediasoup.types.DataConsumer>();

	public constructor(
		public readonly config: MediasoupServiceConfig
	) {

	}
	
	public async start() {
		if (this._run) return;
		this._run = true;

		for (let i = 0; i < this.config.numberOfWorkers; i++) {
			const worker = await mediasoup.createWorker(this.config.workerSettings);

			worker.once('died', () => {
				this.workers.delete(worker.pid);
				logger.error(`Worker ${worker.pid} died`);
			});
			this.workers.set(worker.pid, worker);	

			logger.info(`Worker ${worker.pid} created`);
		}
	}

	public async stop() {
		if (!this._run) return;
		this._run = false;

		for (const worker of this.workers.values()) {
			worker.close();
		}
	}

	public async getOrCreateRouter(routerId?: string): Promise<mediasoup.types.Router> {		
		if (!this.workers) throw new Error('Worker is not started');
		
		let router = this.routers.get(routerId || '');
		
		if (router) return router;

		const worker = [...this.workers.values()][Math.floor(Math.random() * this.workers.size)];
		router = await worker.createRouter({
			mediaCodecs: this.config.mediaCodecs,
		});

		const addTransport = (transport: mediasoup.types.Transport) => this._addTransport(router!, transport);

		router.observer.once('close', () => {
			router.observer.off('newtransport', addTransport);
			this.routers.delete(router!.id);

			logger.info(`Router ${router!.id} closed`);
		})
		router.observer.on('newtransport', addTransport);
		this.routers.set(router.id, router);

		logger.info(`Router ${router.id} created`);
		return router;
	}

	public async consumeMediaProducer(producerId: string, consumingClient: ClientContext): Promise<mediasoup.types.Consumer> {
		const mediaProducer = this.mediaProducers.get(producerId);
		logger.info(`Attempt to consume media producer ${mediaProducer?.id} to client ${consumingClient.clientId}`);

		if (!mediaProducer || !consumingClient) {
			throw new Error(`Media producer ${producerId} or consuming client ${consumingClient.clientId} not found`);
		} else if (consumingClient.rcvTransport === undefined) {
			throw new Error(`Client ${consumingClient.clientId} has no receiving transport`);
		}
		

		const router = this.routers.get(mediaProducer.appData.routerId);
		if (!router) {
			throw new Error(`Router ${mediaProducer.appData.routerId} not found`);
		}

		const consumer = await consumingClient.rcvTransport.consume<ConsumerAppData>({
			producerId: mediaProducer.id,
			rtpCapabilities: router.rtpCapabilities,
			paused: mediaProducer.kind === 'video',
			appData: {
				remoteClosed: false,
			}
		});
		const onProducerPause = () => consumingClient.send(new ControlConsumerNotification(
			consumer.id,
			'producerPaused',
		));
		const onProducerResume = () => consumingClient.send(new ControlConsumerNotification(
			consumer.id,
			'producerResume',
		));

		consumer.observer.once('close', () => {
			mediaProducer.observer.off('pause', onProducerPause);
			mediaProducer.observer.off('resume', onProducerResume);
			consumingClient.mediaConsumers.delete(consumer.id);

			if (!consumer.appData.remoteClosed) {
				consumingClient.send(new ControlConsumerNotification(
					consumer.id,
					'close',
				));
			}
		});
		mediaProducer.observer.on('pause', onProducerPause);
		mediaProducer.observer.on('resume', onProducerResume);
		consumingClient.mediaConsumers.add(consumer.id);

		return consumer;
	};

	private _addTransport = (router: mediasoup.types.Router, transport: mediasoup.types.Transport) => {
		
		const addProducer = (producer: mediasoup.types.Producer) => this._addProducer(router, transport, producer);
		const addConsumer = (consumer: mediasoup.types.Consumer) => this._addConsumer(router, transport, consumer);
		const addDataProducer = (dataProducer: mediasoup.types.DataProducer) => this._addDataProducer(router, transport, dataProducer);
		const addDataConsumer = (dataConsumer: mediasoup.types.DataConsumer) => this._addDataConsumer(router, transport, dataConsumer);

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

	}

	private _addProducer = (router: mediasoup.types.Router, transport: mediasoup.types.Transport, producer: mediasoup.types.Producer) => {
		producer.observer.once('close', () => {
			this.mediaProducers.delete(producer.id);

			logger.info(`Producer ${producer.id} closed on transport ${transport.id} on router ${router.id}`);
		});

		producer.appData.routerId = router.id;
		producer.appData.transportId = transport.id;
		producer.appData.remoteClosed = false;
		this.mediaProducers.set(producer.id, producer as mediasoup.types.Producer<ProducerAppData>);

		logger.info(`Producer ${producer.id} created on transport ${transport.id} on router ${router.id}`);
	}

	private _addConsumer = (router: mediasoup.types.Router, transport: mediasoup.types.Transport, consumer: mediasoup.types.Consumer) => {
		consumer.observer.once('close', () => {
			this.mediaConsumers.delete(consumer.id);

			logger.info(`Consumer ${consumer.id} closed on transport ${transport.id} on router ${router.id}`);
		});
		this.mediaConsumers.set(consumer.id, consumer);

		logger.info(`Consumer ${consumer.id} created on transport ${transport.id} on router ${router.id}`);
	}

	private _addDataProducer = (router: mediasoup.types.Router, transport: mediasoup.types.Transport, dataProducer: mediasoup.types.DataProducer) => {
		dataProducer.observer.once('close', () => {
			this.dataProducers.delete(dataProducer.id);

			logger.info(`Data producer ${dataProducer.id} closed on transport ${transport.id} on router ${router.id}`);
		});
		this.dataProducers.set(dataProducer.id, dataProducer);

		logger.info(`Data producer ${dataProducer.id} created on transport ${transport.id} on router ${router.id}`);
	}

	private _addDataConsumer = (router: mediasoup.types.Router, transport: mediasoup.types.Transport, dataConsumer: mediasoup.types.DataConsumer) => {
		dataConsumer.observer.once('close', () => {
			this.dataConsumers.delete(dataConsumer.id);

			logger.info(`Data consumer ${dataConsumer.id} closed on transport ${transport.id} on router ${router.id}`);
		});
		this.dataConsumers.set(dataConsumer.id, dataConsumer);

		logger.info(`Data consumer ${dataConsumer.id} created on transport ${transport.id} on router ${router.id}`);
	}

	
}