import { Observer } from "@observertc/observer-js";
import { ClientContext } from "../common/ClientContext";
import { createLogger } from "../common/logger";
import { ClientMessageContext } from "./ClientMessageListener";
import { 
	ObservedGetOngoingCallResponse, 
	ObserverGetCallStatsResponse, 
	Response 
} from "../protocols/MessageProtocol";

const logger = createLogger('ClientMonitorSampleNotificatinListener');

export type ClientMonitorSampleNotificatinListenerContext = {
	observer: Observer,
	clients: Map<string, ClientContext>;
}

export function createObserverRequestListener(listenerContext: ClientMonitorSampleNotificatinListenerContext) {
	const { 
		observer,
	} = listenerContext;
	const result = async (messageContext: ClientMessageContext) => {
		const { 
			message: request,
		} = messageContext;
		
		if (request.type !== 'observer-request') {
			return console.warn(`Invalid message type ${request.type}`);
		}

		const {
			payload,
			type,
		} = request.operation;
		let response: unknown | undefined;
		let error: string | undefined;

		try {
			switch (type) {
				case 'getOngoingCalls': {
					let reply: ObservedGetOngoingCallResponse = {
						calls: [],
					};

					for (const [callId, observedCall] of observer.observedCalls) {
						const clients: ObservedGetOngoingCallResponse['calls'][number]['clients'] = [];

						for (const [clientId, observedClient] of observedCall.clients) {
							const peerConnections: ObservedGetOngoingCallResponse['calls'][number]['clients'][number]['peerConnections'] = [];

							for (const [peerConnectionId, observedPeerConnection] of observedClient.peerConnections) {
								peerConnections.push({
									peerConnectionId,
									inboundAudioTrackIds: Array.from(observedPeerConnection.inboundAudioTracks.keys()),
									inboundVideoTrackIds: Array.from(observedPeerConnection.inboundVideoTracks.keys()),
									outboundAudioTrackIds: Array.from(observedPeerConnection.outboundAudioTracks.keys()),
									outboundVideoTrackIds: Array.from(observedPeerConnection.outboundVideoTracks.keys()),
								});
							}

							clients.push({
								clientId,
								peerConnections,
							});
						}

						reply.calls.push({
							callId,
							clients,
						});
					}

					response = reply;
					break;
				}
				case 'getCallStats': {
					const observedCall = observer.observedCalls.get(payload.callId);

					if (!observedCall) {
						error = `Call ${payload.callId} not found`;
						break;
					}

					const reply: ObserverGetCallStatsResponse = {
						callScore: observedCall.score,
						clients: [],
					};
					for (const client of observedCall.clients.values()) {
						const clientStats: ObserverGetCallStatsResponse['clients'][number] = {
							clientId: client.clientId,
							clientScore: client.score,
							peerConnections: [],
						};
						for (const peerConnection of client.peerConnections.values()) {
							const peerConnectionStats: ObserverGetCallStatsResponse['clients'][number]['peerConnections'][number] = {
								peerConnectionId: peerConnection.peerConnectionId,
								peerConnectionScore: peerConnection.score,
								avgRttInMs: peerConnection.avgRttInMs ?? -1,
								inboundAudioTracks: [],
								inboundVideoTracks: [],
								outboundAudioTracks: [],
								outboundVideoTracks: [],
							};
							for (const track of peerConnection.inboundAudioTracks.values()) {
								peerConnectionStats.inboundAudioTracks.push({
									trackId: track.trackId,
									trackScore: track.score,
									receivingBitrate: track.bitrate,
									totalLostPackets: track.totalLostPackets,
								});
							}
							for (const track of peerConnection.inboundVideoTracks.values()) {
								peerConnectionStats.inboundVideoTracks.push({
									trackId: track.trackId,
									trackScore: track.score,
									receivingBitrate: track.bitrate,
									totalLostPackets: track.totalLostPackets,
								});
							}
							for (const track of peerConnection.outboundAudioTracks.values()) {
								peerConnectionStats.outboundAudioTracks.push({
									trackId: track.trackId,
									trackScore: track.score,
									sendingBitrate: track.sendingBitrate,
								});
							}
							for (const track of peerConnection.outboundVideoTracks.values()) {
								peerConnectionStats.outboundVideoTracks.push({
									trackId: track.trackId,
									trackScore: track.score,
									sendingBitrate: track.sendingBitrate,
								});
							}
							clientStats.peerConnections.push(peerConnectionStats);
						}
						reply.clients.push(clientStats);
					}
					response = reply;
				}
			}
		} catch (err) {
			response = undefined;
			error = `${err}`;
		}
		
		messageContext.send(new Response(
			request.requestId,
			response,
			error
		));
	};

	return result;
}