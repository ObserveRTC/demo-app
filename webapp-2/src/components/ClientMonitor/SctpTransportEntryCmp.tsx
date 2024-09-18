import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { SctpTransportEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import TransportEntryCmp from './TransportEntryCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';

export type SctpTransportEntryProps = {
	entry: SctpTransportEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const SctpTransportEntryCmp: Component<SctpTransportEntryProps> = (props: SctpTransportEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getTransport',
				buttonName: 'Transport',
				action: props.entry.getTransport() ? () => TransportEntryCmp({ entry: props.entry.getTransport()!, next: props.next }) : undefined
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

export default SctpTransportEntryCmp;