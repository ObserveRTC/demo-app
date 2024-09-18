import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { RemoteCandidateEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import TransportEntryCmp from './TransportEntryCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';

export type RemoteCandidateEntryProps = {
	entry: RemoteCandidateEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const RemoteCandidateEntryCmp: Component<RemoteCandidateEntryProps> = (props: RemoteCandidateEntryProps) => {
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
				action: props.entry.getPeerConnection() ? () => PeerConnectionEntryCmp({ entry: props.entry.getPeerConnection()!, next: props.next }) : undefined
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

export default RemoteCandidateEntryCmp;