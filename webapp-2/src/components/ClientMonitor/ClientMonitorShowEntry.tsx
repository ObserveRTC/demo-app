import { createSignal, type Component, JSXElement, Show } from 'solid-js';
import Box from '../Box';
import { clientStore } from '../../stores/LocalClientStore';
import ClientMonitorEntryCmp from './ClientMonitorEntry';

export type ClientMonitorEntryRender = {
	name: string;
	action: () => JSXElement;
}
const ClientMonitorShowEntry: Component = () => {
	const [ actualEntry, setActualEntry ] = createSignal<ClientMonitorEntryRender>({
		name: 'ClientMonitor',
		action: () => <ClientMonitorEntryCmp entry={clientStore.call?.monitor!} next={setActualEntry} />
	});

	return (
		<Show when={actualEntry()} keyed>{entry => {
			console.warn('entry', entry);
			return (
				<Box title={entry.name} full={true}>
					{entry.action()}
				</Box>
			);
		}}
		</Show>
	);
};

export default ClientMonitorShowEntry;
