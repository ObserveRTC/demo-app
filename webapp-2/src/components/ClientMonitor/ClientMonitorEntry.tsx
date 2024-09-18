import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { ClientMonitor } from '@observertc/client-monitor-js';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
// import OutboundRtpEntryCmp from './OutboundRtpEntryCmp';
// import ContributingSourceEntryCmp from './ContributingSourceEntryCmp';
// import CertificateEntryCmp from './CertificateEntryCmp';
// import CodecEntryCmp from './CodecEntryCmp';
// import DataChannelEntryCmp from './DataChannelEntry';
// import IceCandidatePairEntryCmp from './IceCandidatePairEntryCmp';
// import IceServerEntryCmp from './IceServerEntryCmp';
// import InboundRtpEntryCmp from './InboundRtpEntryCmp';
// import LocalCandidateEntryCmp from './LocalCandidateEntryCmp';
// import MediaSourceEntryCmp from './MediaSourceEntryCmp';
// import ReceiverEntryCmp from './ReceiverEntryCmp';
// import RemoteCandidateEntryCmp from './RemoteCandidateEntryCmp';
// import RemoteInboundRtpEntryCmp from './RemoteInboundRtpEntryCmp';
// import RemoteOutboundRtpEntryCmp from './RemoteOutboundRtpEntryCmp';
// import SctpTransportEntryCmp from './SctpTransportEntryCmp';
// import SenderEntryCmp from './SenderEntryCmp';
// import TransceiverEntryCmp from './TransceiverEntryCmp';
// import TransportEntryCmp from './TransportEntryCmp';

export type ClientMonitorProps = {
	entry: ClientMonitor;
	next: Setter<ClientMonitorEntryRender>;
}

const ClientMonitorEntryCmp: Component<ClientMonitorProps> = (props: ClientMonitorProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
		]);
		setIterableNavigations([
			// {
			// 	name: 'codecs',
			// 	items: [...props.entry.codecs].map((codec) => ({
			// 		key: `Codec ${codec.stats.payloadType}`,
			// 		action: () => CodecEntryCmp({ entry: codec, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'inboundRtps',
			// 	items: [...props.entry.inboundRtps].map((inboundRtp) => ({
			// 		key: `Track (${inboundRtp.getTrackId()}) ${inboundRtp.stats.ssrc}`,
			// 		action: () => InboundRtpEntryCmp({ entry: inboundRtp, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'outboundRtps',
			// 	items: [...props.entry.outboundRtps].map((outboundRtp) => ({
			// 		key: `Track (${outboundRtp.getTrackId()}) ${outboundRtp.stats.ssrc}`,
			// 		action: () => OutboundRtpEntryCmp({ entry: outboundRtp, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'remoteInboundRtps',
			// 	items: [...props.entry.remoteInboundRtps].map((remoteInboundRtp) => ({
			// 		key: `Track (${remoteInboundRtp.getOutboundRtp()?.getTrackId()}) ${remoteInboundRtp.stats.ssrc}`,
			// 		action: () => RemoteInboundRtpEntryCmp({ entry: remoteInboundRtp, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'remoteOutboundRtps',
			// 	items: [...props.entry.remoteOutboundRtps].map((remoteOutboundRtp) => ({
			// 		key: `Track (${remoteOutboundRtp.getInboundRtp()?.getTrackId()}) ${remoteOutboundRtp.stats.ssrc}`,
			// 		action: () => RemoteOutboundRtpEntryCmp({ entry: remoteOutboundRtp, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'mediaSources',
			// 	items: [...props.entry.mediaSources].map((mediaSource) => ({
			// 		key: `Media Source (id: ${mediaSource.stats.id})`,
			// 		action: () => MediaSourceEntryCmp({ entry: mediaSource, next: props.next })
			// 	}))	
			// },
			// {
			// 	name: 'dataChannels',
			// 	items: [...props.entry.dataChannels].map((dataChannel) => ({
			// 		key: `Data Channel (id: ${dataChannel.stats.id})`,
			// 		action: () => DataChannelEntryCmp({ entry: dataChannel, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'transports',
			// 	items: [...props.entry.transports].map((transport) => ({
			// 		key: `Transport (id: ${transport.stats.id})`,
			// 		action: () => TransportEntryCmp({ entry: transport, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'iceCandidatePairs',
			// 	items: [...props.entry.iceCandidatePairs].map((iceCandidatePair) => ({
			// 		key: `ICE Candidate Pair (local: ${iceCandidatePair.getLocalCandidate()?.stats.address} remote: ${iceCandidatePair.getRemoteCandidate()?.stats.address})`,
			// 		action: () => IceCandidatePairEntryCmp({ entry: iceCandidatePair, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'iceLocalCandidates',
			// 	items: [...props.entry.iceLocalCandidates].map((iceLocalCandidate) => ({
			// 		key: `ICE Local Candidate (address: ${iceLocalCandidate.stats.address})`,
			// 		action: () => LocalCandidateEntryCmp({ entry: iceLocalCandidate, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'iceRemoteCandidates',
			// 	items: [...props.entry.iceRemoteCandidates].map((iceRemoteCandidate) => ({
			// 		key: `ICE Remote Candidate (address: ${iceRemoteCandidate.stats.address})`,
			// 		action: () => RemoteCandidateEntryCmp({ entry: iceRemoteCandidate, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'transceivers',
			// 	items: [...props.entry.transceivers].map((transceiver) => ({
			// 		key: `Transceiver ${transceiver.stats.kind}`,
			// 		action: () => TransceiverEntryCmp({ entry: transceiver, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'senders',
			// 	items: [...props.entry.senders].map((sender) => ({
			// 		key: `Sender (${sender.stats.ssrc})`,
			// 		action: () => SenderEntryCmp({ entry: sender, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'receivers',
			// 	items: [...props.entry.receivers].map((receiver) => ({
			// 		key: `Receiver (${receiver.stats.ssrc})`,
			// 		action: () => ReceiverEntryCmp({ entry: receiver, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'sctpTransports',
			// 	items: [...props.entry.sctpTransports].map((sctpTransport) => ({
			// 		key: `SCTP Transport (id: ${sctpTransport.stats.id})`,
			// 		action: () => SctpTransportEntryCmp({ entry: sctpTransport, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'certificates',
			// 	items: [...props.entry.certificates].map((certificate) => ({
			// 		key: `Certificate (fingerprint: ${certificate.stats.fingerprint})`,
			// 		action: () => CertificateEntryCmp({ entry: certificate, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'iceServers',
			// 	items: [...props.entry.iceServers].map((iceServer) => ({
			// 		key: `ICE Server (url: ${iceServer.stats.url})`,
			// 		action: () => IceServerEntryCmp({ entry: iceServer, next: props.next })
			// 	}))
			// },
			// {
			// 	name: 'contributingSources',
			// 	items: [...props.entry.contributingSources].map((contributingSource) => ({
			// 		key: `Contributing Source (${contributingSource.stats.id})`,
			// 		action: () => ContributingSourceEntryCmp({ entry: contributingSource, next: props.next })
			// 	}))
			// },
			{
				name: 'peerConnections',
				items: [...props.entry.peerConnections].map((peerConnection) => ({
					key: `PeerConnection (${peerConnection.peerConnectionId}, label: ${peerConnection.label})`,
					action: () => PeerConnectionEntryCmp({ entry: peerConnection, next: props.next })
				}))
			}
		]);
		setProperties({
			// selectedIceCandidatePair: props.entry.getSelectedIceCandidatePair(),
			browser: props.entry.browser,
			operatingSystem: props.entry.operationSystem,
			engine: props.entry.engine,
			platform: props.entry.platform,
			created: props.entry.created,
			sendingAudioBitrate: props.entry.sendingAudioBitrate,
			sendingVideoBitrate: props.entry.sendingVideoBitrate,
			receivingAudioBitrate: props.entry.receivingAudioBitrate,
			receivingVideoBitrate: props.entry.receivingVideoBitrate,
	
			totalInboundPacketsLost: props.entry.totalInboundPacketsLost,
			totalInboundPacketsReceived: props.entry.totalInboundPacketsReceived,
			totalOutboundPacketsSent: props.entry.totalOutboundPacketsSent,
			totalOutboundPacketsReceived: props.entry.totalOutboundPacketsReceived,
			totalOutboundPacketsLost: props.entry.totalOutboundPacketsLost,
			totalDataChannelBytesSent: props.entry.totalDataChannelBytesSent,
			totalDataChannelBytesReceived: props.entry.totalDataChannelBytesReceived,
			totalSentAudioBytes: props.entry.totalSentAudioBytes,
			totalSentVideoBytes: props.entry.totalSentVideoBytes,
			totalReceivedAudioBytes: props.entry.totalReceivedAudioBytes,
			totalReceivedVideoBytes: props.entry.totalReceivedVideoBytes,
			totalAvailableIncomingBitrate: props.entry.totalAvailableIncomingBitrate,
			totalAvailableOutgoingBitrate: props.entry.totalAvailableOutgoingBitrate,


			deltaInboundPacketsLost: props.entry.deltaInboundPacketsLost,
			deltaInboundPacketsReceived: props.entry.deltaInboundPacketsReceived,
			deltaOutboundPacketsSent: props.entry.deltaOutboundPacketsSent,
			deltaOutboundPacketsReceived: props.entry.deltaOutboundPacketsReceived,
			deltaOutboundPacketsLost: props.entry.deltaOutboundPacketsLost,
			deltaDataChannelBytesSent: props.entry.deltaDataChannelBytesSent,
			deltaDataChannelBytesReceived: props.entry.deltaDataChannelBytesReceived,
			deltaSentAudioBytes: props.entry.deltaSentAudioBytes,
			deltaSentVideoBytes: props.entry.deltaSentVideoBytes,
			deltaReceivedAudioBytes: props.entry.deltaReceivedAudioBytes,
			deltaReceivedVideoBytes: props.entry.deltaReceivedVideoBytes,
		
			avgRttInSec: props.entry.avgRttInSec,
			highestSeenSendingBitrate: props.entry.highestSeenSendingBitrate,
			highestSeenReceivingBitrate: props.entry.highestSeenReceivingBitrate,
			highestSeenAvailableOutgoingBitrate: props.entry.highestSeenAvailableOutgoingBitrate,
			highestSeenAvailableIncomingBitrate: props.entry.highestSeenAvailableIncomingBitrate,
			sendingFractionLost: props.entry.sendingFractionLost,
			receivingFractionLost: props.entry.receivingFractionLost,
		});
	};
	onMount(() => {
		clientStore.call?.monitor?.on('stats-collected', onChange);
	});
	onCleanup(() => {
		clientStore.call?.monitor?.off('stats-collected', onChange);
	});
	return (
		<EntryBaseCmp iterableNavigations={iterableNavigations()} navigations={navigations()} properties={properties()} next={props.next} />
	);
};

export default ClientMonitorEntryCmp;