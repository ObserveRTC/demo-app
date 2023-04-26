import Prometheus from 'prom-client';
import { EvaluatorProcess } from "@observertc/observer-js";

export function createSfuEvaluator(registry: Prometheus.Registry): EvaluatorProcess {
    
    const concurrentRtpStreams = new Prometheus.Gauge({
		registers: [registry],
		name: 'concurrent_rtp_streams',
		help: 'The number of concurrent RTP streams',
	});

    return (async (context) => {
        const { storages } = context;

        const [
            numberOfInboundRtpStreams,
            numberOfOutboundRtpStreams
        ] = await Promise.all([
            storages.sfuInboundRtpPadStorage.size(),
            storages.sfuOutboundRtpPadStorage.size(),
        ]);

        concurrentRtpStreams.set(numberOfInboundRtpStreams + numberOfOutboundRtpStreams);
    });
}