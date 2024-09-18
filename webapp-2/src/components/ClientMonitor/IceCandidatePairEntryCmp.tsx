import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { IceCandidatePairEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import TransportEntryCmp from './TransportEntryCmp';
import LocalCandidateEntryCmp from './LocalCandidateEntryCmp';
import RemoteCandidateEntryCmp from './RemoteCandidateEntryCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';

export type IceCandidatePairEntryProps = {
	entry: IceCandidatePairEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const IceCandidatePairEntryCmp: Component<IceCandidatePairEntryProps> = (props: IceCandidatePairEntryProps) => {
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
				name: 'getLocalCandidate',
				buttonName: 'Local Candidate',
				action: props.entry.getLocalCandidate() ? () => LocalCandidateEntryCmp({ entry: props.entry.getLocalCandidate()!, next: props.next }) : undefined
			},
			{
				name: 'getRemoteCandidate',
				buttonName: 'Remote Candidate',
				action: props.entry.getRemoteCandidate() ? () => RemoteCandidateEntryCmp({ entry: props.entry.getRemoteCandidate()!, next: props.next }) : undefined
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

export default IceCandidatePairEntryCmp;