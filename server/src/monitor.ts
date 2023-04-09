import { EvaluatorProcess, SfuEventReport } from "@observertc/observer-js";
import Prometheus from 'prom-client';
import { createLogger } from "./logger";

const logger = createLogger('MonitorProcess');

export function createMonitorProcess(registry: Prometheus.Registry): EvaluatorProcess {
	
	const callDurations = new Prometheus.Histogram({
		registers: [registry],
		name: 'call_durations',
		help: 'Histogram for duration of calls in minutes',
		buckets: [0, 5, 10, 30, 60, 120]
	});

	const turnUsage = new Prometheus.Gauge({
		registers: [registry],
		name: 'turn_usage',
		help: 'The percentage of client using TURN',
	});

	return async (context) => {
		const { 
			observedCalls,
			endedCalls,
			// detachedClients
			reports,
			storages
		} = context;
		
		// const calls = Array.from(observedCalls.observedCalls());
		// const clients = Array.from(calls.flatMap(call => Array.from(call.observedClients())));
		// const peerConnections = Array.from(clients.flatMap(peerConnection => Array.from(peerConnection.observedPeerConnections())));
		// const inboundAudioTracks = Array.from(peerConnections.flatMap(peerConnection => Array.from(peerConnection.inboundAudioTracks())));
		// const inboundVideoTracks = Array.from(peerConnections.flatMap(peerConnection => Array.from(peerConnection.inboundVideoTracks())));
		// const outboundAudioTracks = Array.from(peerConnections.flatMap(peerConnection => Array.from(peerConnection.outboundAudioTracks())));
		// const outboundVideoTracks = Array.from(peerConnections.flatMap(peerConnection => Array.from(peerConnection.outboundVideoTracks())));

		// console.warn("calls", calls);
		// console.warn("clients", clients);
		// console.warn("peerConnections", peerConnections);
		// console.warn("inboundAudioTracks", inboundAudioTracks);
		// console.warn("inboundVideoTracks", inboundVideoTracks);
		// console.warn("outboundAudioTracks", outboundAudioTracks);
		// console.warn("outboundVideoTracks", outboundVideoTracks);

		// Observe call durations
		for (const endedCall of endedCalls) {
			const elapsedTimeInMins = (endedCall.ended -  Number(endedCall.started)) / (60 * 1000);
			callDurations.observe(elapsedTimeInMins);
		}

		// how many clients using turn
		const { peerConnectionStorage, clientStorage } = storages;
		const clientsUsingTurn = new Set<string>();
		for await (const [peerConnectionId, peerConnection] of peerConnectionStorage) {
			if (!peerConnection.clientId)
				continue;
			
			const turnCandidateIds = peerConnection.iceRemoteCandidates.filter(c => c.candidateType === 'relay').map(c => c.id);
			const isClientUseTurn = peerConnection.iceCandidatePairs.filter(c => turnCandidateIds.includes(c.remoteCandidateId));
			if (0 < isClientUseTurn.length) 
				clientsUsingTurn.add(peerConnection.clientId);
		}
		const numberOfClients = await clientStorage.size();
		turnUsage.set((clientsUsingTurn.size / numberOfClients) * 100)


		// save sfu load at a time by creating a new report
		const sfuUsageReport: SfuEventReport = {
			serviceId: 'myServiceId',
			name: 'SFU_LOAD_REPORT',
			timestamp: Date.now(),

		}
		reports.addSfuEventReport(sfuUsageReport);
		
	}
}