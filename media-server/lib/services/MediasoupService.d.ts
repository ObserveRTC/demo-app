import * as mediasoup from 'mediasoup';
import { ClientContext } from '../common/ClientContext';
export type MediasoupServiceConfig = {
    workerSettings: mediasoup.types.WorkerSettings;
    mediaCodecs: mediasoup.types.RtpCodecCapability[];
};
type ProducerAppData = {
    routerId: string;
    transportId: string;
    remoteClosed?: boolean;
};
type ConsumerAppData = {
    remoteClosed?: boolean;
};
export declare class MediasoupService {
    readonly config: MediasoupServiceConfig;
    private _run;
    private _worker?;
    readonly routers: Map<string, mediasoup.types.Router<mediasoup.types.AppData>>;
    readonly transports: Map<string, mediasoup.types.Transport<mediasoup.types.AppData, mediasoup.types.TransportEvents, mediasoup.types.TransportObserver>>;
    readonly mediaProducers: Map<string, mediasoup.types.Producer<ProducerAppData>>;
    readonly mediaConsumers: Map<string, mediasoup.types.Consumer<ConsumerAppData>>;
    readonly dataProducers: Map<string, mediasoup.types.DataProducer<mediasoup.types.AppData>>;
    readonly dataConsumers: Map<string, mediasoup.types.DataConsumer<mediasoup.types.AppData>>;
    constructor(config: MediasoupServiceConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    getOrCreateRouter(routerId?: string): Promise<mediasoup.types.Router>;
    consumeMediaProducer(producerId: string, consumingClient: ClientContext): Promise<mediasoup.types.Consumer>;
    private _addTransport;
    private _addProducer;
    private _addConsumer;
    private _addDataProducer;
    private _addDataConsumer;
}
export {};
//# sourceMappingURL=MediasoupService.d.ts.map