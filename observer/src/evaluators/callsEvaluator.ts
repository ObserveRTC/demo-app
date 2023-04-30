import { CallEventReport, EvaluatorProcess } from "@observertc/observer-js";
import Prometheus from 'prom-client';
import { createLogger } from "../common/logger";

const logger = createLogger('CallsEvaluator');

export function createCallsEvaluator(registry: Prometheus.Registry): EvaluatorProcess {
	
	const callDurations = new Prometheus.Histogram({
		registers: [registry],
		name: 'call_durations',
		help: 'Histogram for duration of calls in minutes',
		buckets: [0, 5, 10, 30, 60, 120]
	});

	const callSummaries = new Map<string, {
		maxParticipants: number,
	}>();

	return async (context) => {
		const { 
			endedCalls,
			reports,
			storages
		} = context;
		
		// Observe call durations
		for (const endedCall of endedCalls) {
			const elapsedTimeInMins = (endedCall.ended -  Number(endedCall.started)) / (60 * 1000);
			callDurations.observe(elapsedTimeInMins);
		}

		// Reports call summaries
		for (const endedCall of endedCalls) {
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