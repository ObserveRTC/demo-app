import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { PeerConnectionEntry } from '@observertc/client-monitor-js';
import OutboundRtpEntryCmp from './OutboundRtpEntryCmp';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import IceCandidatePairEntryCmp from './IceCandidatePairEntryCmp';
import CodecEntryCmp from './CodecEntryCmp';
import RemoteInboundRtpEntryCmp from './RemoteInboundRtpEntryCmp';
import RemoteOutboundRtpEntryCmp from './RemoteOutboundRtpEntryCmp';
import MediaSourceEntryCmp from './MediaSourceEntryCmp';
import DataChannelEntryCmp from './DataChannelEntry';
import TransportEntryCmp from './TransportEntryCmp';
import LocalCandidateEntryCmp from './LocalCandidateEntryCmp';
import RemoteCandidateEntryCmp from './RemoteCandidateEntryCmp';
import TransceiverEntryCmp from './TransceiverEntryCmp';
import SenderEntryCmp from './SenderEntryCmp';
import ReceiverEntryCmp from './ReceiverEntryCmp';
import SctpTransportEntryCmp from './SctpTransportEntryCmp';
import CertificateEntryCmp from './CertificateEntryCmp';
import IceServerEntryCmp from './IceServerEntryCmp';
import ContributingSourceEntryCmp from './ContributingSourceEntryCmp';
import InboundRtpEntryCmp from './InboundRtpEntryCmp';
import AudioPlayoutEntryCmp from './AudioPlayoutEntryCmp';

export type PeerConnectionEntryProps = {
	entry: PeerConnectionEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const PeerConnectionEntryCmp: Component<PeerConnectionEntryProps> = (props: PeerConnectionEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{ 
				name: 'getSelectedIceCandidatePair', 
				buttonName: 'Selected ICE Candidate Pair',
				action: props.entry.getSelectedIceCandidatePair() ? () => IceCandidatePairEntryCmp({ entry: props.entry.getSelectedIceCandidatePair()!, next: props.next }) : undefined 
			},
		]);
		setIterableNavigations([
			{
				name: 'codecs',
				items: [...props.entry.codecs()].map((codec) => ({
					key: `Codec ${codec.stats.payloadType}`,
					action: () => CodecEntryCmp({ entry: codec, next: props.next })
				}))
			},
			{
				name: 'inboundRtps',
				items: [...props.entry.inboundRtps()].map((inboundRtp) => ({
					key: `Track (${inboundRtp.getTrackId()}) ${inboundRtp.stats.ssrc}`,
					action: () => InboundRtpEntryCmp({ entry: inboundRtp, next: props.next })
				}))
			},
			{
				name: 'outboundRtps',
				items: [...props.entry.outboundRtps()].map((outboundRtp) => ({
					key: `Track (${outboundRtp.getTrackId()}) ${outboundRtp.stats.ssrc}`,
					action: () => OutboundRtpEntryCmp({ entry: outboundRtp, next: props.next })
				}))
			},
			{
				name: 'remoteInboundRtps',
				items: [...props.entry.remoteInboundRtps()].map((remoteInboundRtp) => ({
					key: `Track (${remoteInboundRtp.getOutboundRtp()?.getTrackId()}) ${remoteInboundRtp.stats.ssrc}`,
					action: () => RemoteInboundRtpEntryCmp({ entry: remoteInboundRtp, next: props.next })
				}))
			},
			{
				name: 'remoteOutboundRtps',
				items: [...props.entry.remoteOutboundRtps()].map((remoteOutboundRtp) => ({
					key: `Track (${remoteOutboundRtp.getInboundRtp()?.getTrackId()}) ${remoteOutboundRtp.stats.ssrc}`,
					action: () => RemoteOutboundRtpEntryCmp({ entry: remoteOutboundRtp, next: props.next })
				}))
			},
			{
				name: 'mediaSources',
				items: [...props.entry.mediaSources()].map((mediaSource) => ({
					key: `Media Source (id: ${mediaSource.stats.id})`,
					action: () => MediaSourceEntryCmp({ entry: mediaSource, next: props.next })
				}))	
			},
			{
				name: 'dataChannels',
				items: [...props.entry.dataChannels()].map((dataChannel) => ({
					key: `Data Channel (id: ${dataChannel.stats.id})`,
					action: () => DataChannelEntryCmp({ entry: dataChannel, next: props.next })
				}))
			},
			{
				name: 'transports',
				items: [...props.entry.transports()].map((transport) => ({
					key: `Transport (id: ${transport.stats.id})`,
					action: () => TransportEntryCmp({ entry: transport, next: props.next })
				}))
			},
			{
				name: 'iceCandidatePairs',
				items: [...props.entry.iceCandidatePairs()].map((iceCandidatePair) => ({
					key: `ICE Candidate Pair (local: ${iceCandidatePair.getLocalCandidate()?.stats.address} remote: ${iceCandidatePair.getRemoteCandidate()?.stats.address})`,
					action: () => IceCandidatePairEntryCmp({ entry: iceCandidatePair, next: props.next })
				}))
			},
			{
				name: 'localCandidates',
				items: [...props.entry.localCandidates()].map((iceLocalCandidate) => ({
					key: `ICE Local Candidate (address: ${iceLocalCandidate.stats.address})`,
					action: () => LocalCandidateEntryCmp({ entry: iceLocalCandidate, next: props.next })
				}))
			},
			{
				name: 'remoteCandidates',
				items: [...props.entry.remoteCandidates()].map((iceRemoteCandidate) => ({
					key: `ICE Remote Candidate (address: ${iceRemoteCandidate.stats.address})`,
					action: () => RemoteCandidateEntryCmp({ entry: iceRemoteCandidate, next: props.next })
				}))
			},
			{
				name: 'audioPlayouts',
				items: [...props.entry.audioPlayouts()].map((audioPlayout) => ({
					key: `Audio Playout (id: ${audioPlayout.stats.id})`,
					action: () => AudioPlayoutEntryCmp({ entry: audioPlayout, next: props.next })
				}))
			},
			{
				name: 'transceivers',
				items: [...props.entry.transceivers()].map((transceiver) => ({
					key: `Transceiver ${transceiver.stats.kind}`,
					action: () => TransceiverEntryCmp({ entry: transceiver, next: props.next })
				}))
			},
			{
				name: 'senders',
				items: [...props.entry.senders()].map((sender) => ({
					key: `Sender (${sender.stats.ssrc})`,
					action: () => SenderEntryCmp({ entry: sender, next: props.next })
				}))
			},
			{
				name: 'receivers',
				items: [...props.entry.receivers()].map((receiver) => ({
					key: `Receiver (${receiver.stats.ssrc})`,
					action: () => ReceiverEntryCmp({ entry: receiver, next: props.next })
				}))
			},
			{
				name: 'sctpTransports',
				items: [...props.entry.sctpTransports()].map((sctpTransport) => ({
					key: `SCTP Transport (id: ${sctpTransport.stats.id})`,
					action: () => SctpTransportEntryCmp({ entry: sctpTransport, next: props.next })
				}))
			},
			{
				name: 'certificates',
				items: [...props.entry.certificates()].map((certificate) => ({
					key: `Certificate (fingerprint: ${certificate.stats.fingerprint})`,
					action: () => CertificateEntryCmp({ entry: certificate, next: props.next })
				}))
			},
			{
				name: 'iceServers',
				items: [...props.entry.iceServers()].map((iceServer) => ({
					key: `ICE Server (url: ${iceServer.stats.url})`,
					action: () => IceServerEntryCmp({ entry: iceServer, next: props.next })
				}))
			},
			{
				name: 'contributingSources',
				items: [...props.entry.contributingSources()].map((contributingSource) => ({
					key: `Contributing Source (${contributingSource.stats.id})`,
					action: () => ContributingSourceEntryCmp({ entry: contributingSource, next: props.next })
				}))
			}

		]);
		setProperties({
			peerConnectionId: props.entry.peerConnectionId,
			statsId: props.entry.statsId,
			label: props.entry.label,
			usingTCP: props.entry.usingTCP,
			usingTURN: props.entry.usingTURN,

			totalInboundPacketsLost: props.entry.totalInboundPacketsLost,
			totalInboundPacketsReceived: props.entry.totalInboundPacketsReceived,
			totalOutboundPacketsLost: props.entry.totalOutboundPacketsLost,
			totalOutboundPacketsReceived: props.entry.totalOutboundPacketsReceived,
			totalOutboundPacketsSent: props.entry.totalOutboundPacketsSent,
			totalSentAudioBytes: props.entry.totalSentAudioBytes,
			totalSentVideoBytes: props.entry.totalSentVideoBytes,
			totalReceivedAudioBytes: props.entry.totalReceivedAudioBytes,
			totalReceivedVideoBytes: props.entry.totalReceivedVideoBytes,
			totalDataChannelBytesReceived: props.entry.totalDataChannelBytesReceived,
			totalDataChannelBytesSent: props.entry.totalDataChannelBytesSent,

			deltaInboundPacketsLost: props.entry.deltaInboundPacketsLost,
			deltaInboundPacketsReceived: props.entry.deltaInboundPacketsReceived,
			deltaOutboundPacketsLost: props.entry.deltaOutboundPacketsLost,
			deltaOutboundPacketsReceived: props.entry.deltaOutboundPacketsReceived,
			deltaOutboundPacketsSent: props.entry.deltaOutboundPacketsSent,
			deltaSentAudioBytes: props.entry.deltaSentAudioBytes,
			deltaSentVideoBytes: props.entry.deltaSentVideoBytes,
			deltaReceivedAudioBytes: props.entry.deltaReceivedAudioBytes,
			deltaReceivedVideoBytes: props.entry.deltaReceivedVideoBytes,
			deltaDataChannelBytesSent: props.entry.deltaDataChannelBytesSent,
			deltaDataChannelBytesReceived: props.entry.deltaDataChannelBytesReceived,
			avgRttInS: props.entry.avgRttInS,

			sendingAudioBitrate: props.entry.sendingAudioBitrate,
			sendingVideoBitrate: props.entry.sendingVideoBitrate,
			sendingFractionalLoss: props.entry.sendingFractionalLoss,
			receivingAudioBitrate: props.entry.receivingAudioBitrate,
			receivingVideoBitrate: props.entry.receivingVideoBitrate,
			receivingFractionalLoss: props.entry.receivingFractionalLoss,

			connectionState: props.entry.connectionState,
			connectionEstablishedDurationInMs:  props.entry.connectionEstablishedDurationInMs,
			// last property
			stats: props.entry.stats
		});
	};
	onMount(() => {
		clientStore.call?.monitor?.on('stats-collected', onChange);
	});
	onCleanup(() => {
		clientStore.call?.monitor?.off('stats-collected', onChange);
	});
	return (
		<EntryBaseCmp properties={properties()} navigations={navigations()} iterableNavigations={iterableNavigations()} next={props.next} />
	);
};

export default PeerConnectionEntryCmp;