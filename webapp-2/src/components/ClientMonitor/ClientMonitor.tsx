import { Show, createSignal, onMount, type Component, For } from 'solid-js';
import Box from '../Box';
import { ErrorPaperItem } from '../PaperItem';
import { clientStore } from '../../stores/LocalClientStore';
import ClientMonitorStatsProperties from './ClientMonitorStatsProperties';
import { Accordion } from '../Accordion/Accordion';
import PeerConnectionStatsProperties from './PeerConnectionStatsProperties';


const ClientMonitor: Component = () => {
	const [ error, setError ] = createSignal<string | undefined>();

	onMount(() => {
		const clientMonitor = clientStore.call?.monitor;
		if (!clientMonitor) return;
		clientMonitor.on('error', (e) => setError(`${e}`));
		clientMonitor.totalAvailableIncomingBitrate;
	});
	return (
		<Box title='ClientMonitor (monitor)' full={true}>
			<Show when={error()}>
				<ErrorPaperItem>{error()}</ErrorPaperItem>
			</Show>
			<Accordion title='monitor[stats properties]'>
				<ClientMonitorStatsProperties />
			</Accordion>
			<For each={clientStore.call?.monitor.peerConnections}>
				{ (peerConnection) => (
					<Accordion title={`monitor.peerConnections[${peerConnection.label}][properties]`}>
						<PeerConnectionStatsProperties peerConnectionId={peerConnection.peerConnectionId} />
					</Accordion>
				)}
			</For>
		</Box>
	);
};

export default ClientMonitor;
