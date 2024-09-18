import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { RemoteInboundRtpEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import OutboundRtpEntryCmp from './OutboundRtpEntryCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';

export type RemoteInboundRtpEntryProps = {
	entry: RemoteInboundRtpEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const RemoteInboundRtpEntryCmp: Component<RemoteInboundRtpEntryProps> = (props: RemoteInboundRtpEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getOutboundRtp',
				buttonName: 'Outbound Rtp',
				action: props.entry.getOutboundRtp() ? () => OutboundRtpEntryCmp({ entry: props.entry.getOutboundRtp()!, next: props.next }) : undefined
			},
			{
				name: 'getPeerConnection',
				buttonName: 'Peer Connection',
				action: () => PeerConnectionEntryCmp({ entry: props.entry.getPeerConnection()!, next: props.next })
			}
		]);
		setIterableNavigations([
		]);
		setProperties({
			receivedPackets: props.entry.receivedPackets,
			lostPackets: props.entry.lostPackets,
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

export default RemoteInboundRtpEntryCmp;