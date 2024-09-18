import { Component, Setter, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { TransportEntry } from '@observertc/client-monitor-js';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import EntryBaseCmp, { IterableNavigationItem, NavigationItem } from './EntryBaseCmp';
import IceCandidatePairEntryCmp from './IceCandidatePairEntryCmp';
import CertificateEntryCmp from './CertificateEntryCmp';
import PeerConnectionEntryCmp from './PeerConnectionEntryCmp';

export type TransportEntryProps = {
	entry: TransportEntry;
	next: Setter<ClientMonitorEntryRender>;
}

const TransportEntryCmp: Component<TransportEntryProps> = (props: TransportEntryProps) => {
	const [ properties, setProperties ] = createSignal<Record<string, unknown>>({});
	const [ navigations, setNavigations ] = createSignal<NavigationItem[]>([]);
	const [ iterableNavigations, setIterableNavigations ] = createSignal<IterableNavigationItem[]>([]);
	const onChange = () => {
		setNavigations([
			{
				name: 'getRtcpTransport',
				buttonName: 'RTCP Transport',
				action: props.entry.getRtcpTransport() ? () => TransportEntryCmp({ entry: props.entry.getRtcpTransport()!, next: props.next }) : undefined
			},
			{
				name: 'getSelectedIceCandidatePair',
				buttonName: 'Selected ICE Candidate Pair',
				action: props.entry.getSelectedIceCandidatePair() ? () => IceCandidatePairEntryCmp({ entry: props.entry.getSelectedIceCandidatePair()!, next: props.next }) : undefined
			},
			{
				name: 'getLocalCertificate',
				buttonName: 'Local Certificate',
				action: props.entry.getLocalCertificate() ? () => CertificateEntryCmp({ entry: props.entry.getLocalCertificate()!, next: props.next }) : undefined
			},
			{
				name: 'getRemoteCertificate',
				buttonName: 'Remote Certificate',
				action: props.entry.getRemoteCertificate() ? () => CertificateEntryCmp({ entry: props.entry.getRemoteCertificate()!, next: props.next }) : undefined
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

export default TransportEntryCmp;