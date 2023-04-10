import { CallEventReport, EvaluatorProcess, SfuEventReport } from "@observertc/observer-js";
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

	const callSummaries = new Map<string, {
		maxParticipants: number,
	}>();

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

		// Observe call durations, and reports call summaries
		for (const endedCall of endedCalls) {
			const elapsedTimeInMins = (endedCall.ended -  Number(endedCall.started)) / (60 * 1000);
			callDurations.observe(elapsedTimeInMins);

			if (!endedCall.callId) {
				continue;
			}
			const callSummary = callSummaries.get(endedCall.callId);
			if (!callSummary) {
				continue;
			}

			const callSummaryReport: CallEventReport = {
				serviceId: endedCall.serviceId ?? 'myServiceId',
				name: 'CALL_SUMMARY_REPORT',
				timestamp: Date.now(),
				callId: endedCall.callId,
				roomId: endedCall.roomId,
				attachments: JSON.stringify(callSummary),
			}
			
			reports.addCallEventReport(callSummaryReport);
			callSummaries.delete(endedCall.callId);
		}

		// Observe how many clients using turn
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


		// Iterate calls and update call summaries
		const { callStorage } = storages;
		for await (const [callId, call] of callStorage) {
			const callSummary = callSummaries.get(callId);
			callSummaries.set(callId, {
				maxParticipants: Math.max(callSummary?.maxParticipants ?? 0, call.clientIds.length),
			});
		}
	}
}