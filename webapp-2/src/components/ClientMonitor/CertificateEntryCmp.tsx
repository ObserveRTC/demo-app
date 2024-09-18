import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { CertificateEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';

export type CertificateEntryProps = {
	entry: CertificateEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const CertificateEntryCmp: Component<CertificateEntryProps> = (props: CertificateEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getPeerConnection',
				buttonName: 'Peer Connection',
				action: props.entry.getPeerConnection() ? () => PeerConnectionEntryCmp({ entry: props.entry.getPeerConnection()!, next: props.next }) : undefined
			}
		]);
		setIterableNavigations([
		]);
		setProperties({
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

export default CertificateEntryCmp;