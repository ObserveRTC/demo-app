import { CallEventReport, EvaluatorProcess, SfuEventReport } from "@observertc/observer-js";
import { observer } from "mediasoup";
import Prometheus from 'prom-client';
import { createLogger } from "../logger";

const logger = createLogger('TurnEvaluator');

export function createTurnEvaluator(registry: Prometheus.Registry): EvaluatorProcess {
	
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

	}
}