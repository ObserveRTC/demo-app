import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { TransceiverEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';
import SenderEntryCmp from './SenderEntryCmp';
import ReceiverEntryCmp from './ReceiverEntryCmp';

export type TransceiverEntryProps = {
	entry: TransceiverEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const TransceiverEntryCmp: Component<TransceiverEntryProps> = (props: TransceiverEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getSender',
				buttonName: 'Sender',
				action: props.entry.getSender() ? () => SenderEntryCmp({ entry: props.entry.getSender()!, next: props.next }) : undefined
			},
			{
				name: 'getReceiver',
				buttonName: 'Receiver',
				action: props.entry.getReceiver() ? () => ReceiverEntryCmp({ entry: props.entry.getReceiver()!, next: props.next }): undefined
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

export default TransceiverEntryCmp;