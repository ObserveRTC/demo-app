import { Show, createSignal, onMount, type Component, For } from 'solid-js';
import Box from '../components/Box';
import LocalClientVideo from '../components/LocalClientVideo';
import { produceMedia } from '../actions/actions';
import { ErrorPaperItem } from '../components/PaperItem';
import { Grid } from '@suid/material';
import { clientStore } from '../stores/LocalClientStore';
import { remoteClientStore } from '../stores/RemoteClientsStore';
import RemoteClientVideo from '../components/RemoteClientVideo';
import RemoteClientAudio from '../components/RemoteClientAudio';
import ClientMonitorBaseCharts from '../components/ClientMonitor/ClientMonitorBaseCharts';

// import { setTestState } from '../signals/signals';
// import Button from '../components/Button';

// const TestResults = lazy(() => import('../components/TestResults'));

const Monitor: Component = () => {
	const [ error, setError ] = createSignal<string | undefined>();
	
	onMount(() => {
		produceMedia().catch((e) => setError(`${e}`));
	});

	return (
		<Grid container spacing={2}>
			<Show when={error()}>
				<Grid item xs={12}>
					<ErrorPaperItem>{error()}</ErrorPaperItem>
				</Grid>
			</Show>
			<Grid item xs={8}>
				<Box full={true}>
					<ClientMonitorBaseCharts />
				</Box>
				
			</Grid>
			<Grid item xs={4}>
				<Box title={`Local Client (${clientStore.userId ?? clientStore.call?.config.clientId})`} full={true}>
					<LocalClientVideo showControls={true} />
					{/* <ClientMonitorStateProperties /> */}
				</Box>
				<For each={remoteClientStore.videoConsumerIds}>{(consumerId) => (
					<Box title={`Remote Client (${consumerId})`} full={true}>
						<RemoteClientVideo consumerId={consumerId} />
					</Box>
				)}
				</For>
				<For each={remoteClientStore.audioConsumerIds}>{(consumerId) => (
					<>
						<RemoteClientAudio consumerId={consumerId} />
					</>
				)}
				</For>
			</Grid>
		</Grid>
	);
};

export default Monitor;
