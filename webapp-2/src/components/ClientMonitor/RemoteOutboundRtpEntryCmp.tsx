import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { RemoteOutboundRtpEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';
import InboundRtpEntryCmp from './InboundRtpEntryCmp';

export type RemoteOutboundRtpEntryProps = {
	entry: RemoteOutboundRtpEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const RemoteOutboundRtpEntryCmp: Component<RemoteOutboundRtpEntryProps> = (props: RemoteOutboundRtpEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getInboundRtp',
				buttonName: 'Inbound Rtp',
				action: props.entry.getInboundRtp() ? () => InboundRtpEntryCmp({ entry: props.entry.getInboundRtp()!, next: props.next }) : undefined
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
			getSsrc: props.entry.getSsrc(),
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

export default RemoteOutboundRtpEntryCmp;