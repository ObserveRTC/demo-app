import { createEffect } from 'solid-js';
import { Call, CallConfig } from '../utils/Call';
import { clientStore } from '../stores/LocalClientStore';
import { addAudioConsumerId, addVideoConsumerId, removeAudioConsumerId, removeVideoConsumerId } from '../stores/RemoteClientsStore';
import { ObserverClient } from '../utils/ObserverClient';

// const logger = console;

const MAX_BITRATE = 2000000;

let call: Call;
let observerClient: ObserverClient;

declare global {
	// eslint-disable-next-line no-unused-vars
	interface Window {
		call: Call;
		observerClient?: ObserverClient;
	}
}

createEffect(() => {
	// if (testState() === 'completed') {
	// 	call?.close();
	
	// 	webcamTrack()?.stop();
	// 	setWebcamTrack();
	// 	micTrack()?.stop();
	// 	setMicTrack();
	// }
});

export const connectObserverClient = async (config: ObserverClient['config']): Promise<void> => {
	try {
		if (!observerClient) {
			observerClient = new ObserverClient(config);
			window.observerClient = observerClient;
		}

		await observerClient.connect();
	} catch (err) {
		console.error('createObserverClient error', err);
	}
};

export const joinToCall = async (config: CallConfig): Promise<void> => {

	try {
		if (!call) {
			call = new Call(config);
			window.call = call;

			handleCall();
		}

		await call.join();
	} catch (error) {
		console.error('joinToCall error', error);
		throw error;
		// batch(() => {
		// 	setTestResults({ mediaConnection: '
		// 	setTestState('completed');
		// });
	}
};

export const handleCall = (): void => {
	call.on('newconsumer', (consumer) => {
		consumer.resume();
		console.warn('resumed consumer? ', consumer);

		if (consumer.kind === 'video') {
			addVideoConsumerId(consumer.id);
		} else {
			addAudioConsumerId(consumer.id);
		}

		consumer.observer.on('close', () => {	
			if (consumer.kind === 'video') {
				removeVideoConsumerId(consumer.id);
			} else if (consumer.kind === 'audio') {
				removeAudioConsumerId(consumer.id);
			}
		});
	});

	// let lastBytesReceived = 0;
	// let lastBytesSent = 0;

	// eslint-disable-next-line no-empty-pattern
	call.monitor.on('stats-collected', ({ /** collectedStats */ }) => {
		// if (collectedStats.length !== 2) return setTestResults({ mediaConnection: 'error' });

		// const [ { statsMap: firstStatsMap }, { statsMap: secondStatsMap } ] = collectedStats;
		// const recvTransportStats = firstStatsMap['inbound-rtp'].length > 0 ? firstStatsMap : secondStatsMap;
		// const sendTransportStats = firstStatsMap['inbound-rtp'].length > 0 ? secondStatsMap : firstStatsMap;
		// const recvTransport = recvTransportStats.transport.find((t) => t.dtlsState === 'connected' && t.iceState === 'connected');
		// const sendTransport = sendTransportStats.transport.find((t) => t.dtlsState === 'connected' && t.iceState === 'connected');

		// // if (!recvTransport || !sendTransport) return setTestResults({ mediaConnection: 'error' });

		// const recvSelectedPair = recvTransportStats['candidate-pair'].find((p) => p.id === recvTransport?.selectedCandidatePairId);
		// const sendSelectedPair = sendTransportStats['candidate-pair'].find((p) => p.id === sendTransport?.selectedCandidatePairId);

		// if (!recvSelectedPair || !sendSelectedPair) return setTestResults({ mediaConnection: 'error' });

		// const recvSelectedLocalCandidate = recvTransportStats['local-candidate'].find((c) => c.id === recvSelectedPair.localCandidateId);
		// const sendSelectedLocalCandidate = sendTransportStats['local-candidate'].find((c) => c.id === sendSelectedPair.localCandidateId);

		// if (recvSelectedLocalCandidate?.relayProtocol || sendSelectedLocalCandidate?.relayProtocol)
		// 	setUsingRelay(true);
		// else
		// 	setUsingRelay(false);

		// if (recvSelectedLocalCandidate?.protocol !== 'udp' || sendSelectedLocalCandidate?.protocol !== 'udp')
		// 	setUsingTCP(true);
		// else
		// 	setUsingTCP(false);

		// const maxLoss = call.monitor.inboundRtps.reduce((max, rtp) => Math.max(max, rtp.fractionLoss ?? 0), 0);
		// const currentRtt = call.monitor.storage.avgRttInS!;

		// const deltaBytesReceived = recvTransport.bytesReceived! - lastBytesReceived;
		// const deltaBytesSent = sendTransport.bytesSent! - lastBytesSent;
		// const receiveBitrate = deltaBytesReceived * 8 / 1000000;
		// const sendBitrate = deltaBytesSent * 8 / 1000000;

		// lastBytesReceived = recvTransport.bytesReceived!;
		// lastBytesSent = sendTransport.bytesSent!;

		// const packetLosses = [ ...packetLoss(), maxLoss ];
		// const rtts = [ ...rtt(), currentRtt ];
		// const incomingBitrates = [ ...incomingBitrate(), receiveBitrate ];
		// const outgoingBitrates = [ ...outgoingBitrate(), sendBitrate ];
		// const availableBitrates = [ ...availableOutgoingBitrates(), sendSelectedPair.availableOutgoingBitrate! / 1000000 ];

		// if (incomingBitrates.length > 6) {
		// 	const maxBitrateInMbps = MAX_BITRATE / 1000000.0;

		// 	const outgoingBitratesReduced = outgoingBitrates.slice(4);
		// 	const outgoingBitratesAbove2Mbps = outgoingBitratesReduced.filter((bitrate) => bitrate > maxBitrateInMbps);
		// 	const badOutgoingBitrate = outgoingBitratesAbove2Mbps.length / outgoingBitratesReduced.length < 0.75;

		// 	const incomingBitratesReduced = incomingBitrates.slice(4);
		// 	const incomingBitratesAbove10Mbps = [];

		// 	for (let index = 0; index < outgoingBitratesReduced.length; index++) {
		// 		if (outgoingBitratesReduced[index] > maxBitrateInMbps) {
		// 			if ((5 * maxBitrateInMbps) - incomingBitratesReduced[index] < maxBitrateInMbps) {
		// 				incomingBitratesAbove10Mbps.push(incomingBitratesReduced[index]);
		// 			}
		// 		}
		// 	}
		// 	const badIncomingBitrate = incomingBitratesAbove10Mbps.length / incomingBitratesReduced.length < 0.75;

		// 	const availableBitratesReduced = availableBitrates.slice(4);
		// 	const availableBitratesAbove2Mbps = availableBitratesReduced.filter((bitrate) => bitrate > maxBitrateInMbps);
		// 	const badAvailableBitrate = availableBitratesAbove2Mbps.length / availableBitratesReduced.length < 0.75;

		// 	if (badOutgoingBitrate || badIncomingBitrate || badAvailableBitrate)
		// 		setLowBandwidth(true);
		// 	else
		// 		setLowBandwidth(false);

		// 	const packetLossesReduced = packetLosses.slice(4);
		// 	const packetLossesAbovePercent = packetLossesReduced.filter((loss) => loss > 0.025);
		// 	const badPacketLoss = packetLossesAbovePercent.length / packetLossesReduced.length > 0.10;

		// 	const rttsReduced = rtts.slice(4);
		// 	const rttsAbove200ms = rttsReduced.filter((rtt) => rtt > 0.200);
		// 	const badRtt = rttsAbove200ms.length / rttsReduced.length > 0.20;

		// 	if (badPacketLoss)
		// 		setHighPacketLoss(true);
		// 	else
		// 		setHighPacketLoss(false);

		// 	if (badRtt)
		// 		setHighLatency(true);
		// 	else
		// 		setHighLatency(false);
		// }

		// const warning = usingRelay() || usingTCP() || lowBandwidth() || highPacketLoss() || highLatency();

		// batch(() => {
		// 	setTestResults({ mediaConnection: warning ? 'warning' : 'success' });
		// 	setPacketLoss(packetLosses);
		// 	setRtt(rtts);
		// 	setAvailableOutgoingBitrates(availableBitrates);
		// 	setIncomingBitrate(incomingBitrates);
		// 	setOutgoingBitrate(outgoingBitrates);
		// });
	});
};

export const produceMedia = async (): Promise<void> => {
	let callError: string | undefined;
	const onError = (err: any) => (callError = `${err}`);

	call.on('error', onError);
	try {
		if (!clientStore.mediaStream) throw new Error('produceMedia() missing webcam or mic track');

		const [ webcamTrack ] = clientStore.mediaStream.getVideoTracks();
		const [ micTrack ] = clientStore.mediaStream.getAudioTracks();

		await Promise.all([
			call.sndTransport?.produce({ 
				track: webcamTrack, 
				encodings: [ 
					{ maxBitrate: 200000, scaleResolutionDownBy: 4 }, 
					{ maxBitrate: 500000, scaleResolutionDownBy: 2 }, 
					{ maxBitrate: MAX_BITRATE, scaleResolutionDownBy: 1 } 
				]
			}),
			call.sndTransport?.produce({ track: micTrack }),
		]);

		if (callError) throw new Error(callError);
	} finally {
		call.off('error', onError);
	}
};

