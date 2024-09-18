import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { InboundRtpEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import ReceiverEntryCmp from './ReceiverEntryCmp';
import AudioPlayoutEntryCmp from './AudioPlayoutEntryCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';
import RemoteOutboundRtpEntryCmp from './RemoteOutboundRtpEntryCmp';

export type InboundRtpEntryProps = {
	entry: InboundRtpEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const InboundRtpEntryCmp: Component<InboundRtpEntryProps> = (props: InboundRtpEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getReceiver',
				buttonName: 'Receiver',
				action: props.entry.getReceiver() ? () => ReceiverEntryCmp({ entry: props.entry.getReceiver()!, next: props.next }) : undefined
			},
			{
				name: 'getAudioPlayout',
				buttonName: 'AudioPlayout',
				action: props.entry.getAudioPlayout() ? () => AudioPlayoutEntryCmp({ entry: props.entry.getAudioPlayout()!, next: props.next }) : undefined
			},
			{
				name: 'getRemoteOutboundRtp',
				buttonName: 'RemoteOutboundRtp',
				action: props.entry.getRemoteOutboundRtp() ? () => RemoteOutboundRtpEntryCmp({ entry: props.entry.getRemoteOutboundRtp()!, next: props.next }) : undefined
			},
			{
				name: 'getPeerConnection',
				buttonName: 'Peer Connection',
				action: props.entry.getPeerConnection() ? () => PeerConnectionEntryCmp({ entry: props.entry.getPeerConnection()!, next: props.next }) : undefined
			}
		]);
		setIterableNavigations([
		]);
		setProperties({
			kind: props.entry.kind,
			expectedFrameRate: props.entry.expectedFrameRate,
			sfuStreamId: props.entry.sfuStreamId,
			sfuSinkId: props.entry.sfuSinkId,
			remoteClientId: props.entry.remoteClientId,
			score: props.entry.score,
			avgJitterBufferDelayInMs: props.entry.avgJitterBufferDelayInMs,
			receivingBitrate: props.entry.receivingBitrate,
			receivedBytes: props.entry.receivedBytes,
			lostPackets: props.entry.lostPackets,
			receivedPackets: props.entry.receivedPackets,
			receivedFrames: props.entry.receivedFrames,
			decodedFrames: props.entry.decodedFrames,
			droppedFrames: props.entry.droppedFrames,
			receivedSamples: props.entry.receivedSamples,
			silentConcealedSamples: props.entry.silentConcealedSamples,
			fractionLoss: props.entry.fractionLoss,
			avgRttInS: props.entry.avgRttInS,
			framesPerSecond: props.entry.framesPerSecond,
			fpsVolatility: props.entry.fpsVolatility,
			avgFramesPerSec: props.entry.avgFramesPerSec,
			lastNFramesPerSec: props.entry.lastNFramesPerSec,

			getSsrc: props.entry.getSsrc(),
			getTrackId: props.entry.getTrackId(),

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

export default InboundRtpEntryCmp;