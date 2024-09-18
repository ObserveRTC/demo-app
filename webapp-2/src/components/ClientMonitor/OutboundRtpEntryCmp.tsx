import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { OutboundRtpEntry } from '@observertc/client-monitor-js';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';
import SenderEntryCmp from './SenderEntryCmp';
import RemoteInboundRtpEntryCmp from './RemoteInboundRtpEntryCmp';
import MediaSourceEntryCmp from './MediaSourceEntryCmp';

export type OutboundRtpEntryProps = {
	entry: OutboundRtpEntry;
	next: Setter<ClientMonitorEntryRender>;
}


const OutboundRtpEntryCmp: Component<OutboundRtpEntryProps> = (props: OutboundRtpEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	// eslint-disable-next-line no-unused-vars
	setNavigations([
		{
			name: 'getMediaSource',
			buttonName: 'Media Source',
			action: props.entry.getMediaSource() ? () => MediaSourceEntryCmp({ entry: props.entry.getMediaSource()!, next: props.next }) : undefined
		},
		{
			name: 'getSender',
			buttonName: 'Sender',
			action: props.entry.getSender() ? () => SenderEntryCmp({ entry: props.entry.getSender()!, next: props.next }) : undefined
		},
		{
			name: 'getRemoteInboundRtp',
			buttonName: 'RemoteInboundRtp',
			action: props.entry.getRemoteInboundRtp() ? () => RemoteInboundRtpEntryCmp({ entry: props.entry.getRemoteInboundRtp()!, next: props.next }) : undefined
		},
		{
			name: 'getPeerConnection',
			buttonName: 'Peer Connection',
			action: props.entry.getPeerConnection() ? () => PeerConnectionEntryCmp({ entry: props.entry.getPeerConnection()!, next: props.next }) : undefined
		}
	]);
	setIterableNavigations([
		
	]);
	
	
	const onChange = () => setProperties({
		getSsrc: props.entry.getSsrc(),
		getTrackId: props.entry.getTrackId(),
		kind: props.entry.kind,
		sfuStreamId: props.entry.sfuStreamId,
		score: props.entry.score,
		sendingBitrate: props.entry.sendingBitrate,
		sentBytes: props.entry.sentBytes,
		sentPackets: props.entry.sentPackets,

		// last property
		stats: props.entry.stats
	});
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

export default OutboundRtpEntryCmp;
