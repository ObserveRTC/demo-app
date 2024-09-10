import { Show, createSignal, onMount, type Component, For } from 'solid-js';
import Box from '../components/Box';
import LocalClientVideo from '../components/LocalClientVideo';
import { produceMedia } from '../actions/actions';
import { ErrorPaperItem, PaperItem } from '../components/PaperItem';
import { Button, Grid } from '@suid/material';
import ClientMonitor from '../components/ClientMonitor/ClientMonitor';
import ClientMonitorStateProperties from '../components/ClientMonitor/ClientMonitorStateProperties';
import { clientStore } from '../stores/LocalClientStore';
import { writeClipboard } from '@solid-primitives/clipboard';
import { remoteClientStore } from '../stores/RemoteClientsStore';
import RemoteClientVideo from '../components/RemoteClientVideo';
import RemoteClientAudio from '../components/RemoteClientAudio';

// import { setTestState } from '../signals/signals';
// import Button from '../components/Button';

// const TestResults = lazy(() => import('../components/TestResults'));

const Monitor: Component = () => {
	const [ error, setError ] = createSignal<string | undefined>();
	const [ copyBtnText, setCopyBtnText ] = createSignal<string | undefined>('Copy');
	
	onMount(() => {
		produceMedia().catch((e) => setError(`${e}`));
	});

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<PaperItem>Call: {clientStore.call?.callId} 
					<Button onClick={() => {
						writeClipboard(clientStore.call?.callId ?? '');
						setCopyBtnText('Copied');
						setTimeout(() => {
							setCopyBtnText('Copy');
						}, 2000);
					}}>{copyBtnText()}</Button></PaperItem>
			</Grid>
			<Show when={error()}>
				<Grid item xs={12}>
					<ErrorPaperItem>{error()}</ErrorPaperItem>
				</Grid>
			</Show>
			<Grid item xs={8}>
				<ClientMonitor />
			</Grid>
			<Grid item xs={4}>
				<Box title={`Local Client (${clientStore.userId ?? clientStore.clientId})`} full={true}>
					<LocalClientVideo showControls={true} />
					<ClientMonitorStateProperties />
				</Box>
				<For each={remoteClientStore.videoConsumerIds}>{(consumerId) => (
					<Box title='Remote Client' full={true}>
						<RemoteClientVideo consumerId={consumerId} />
					</Box>
				)}
				</For>
				<For each={remoteClientStore.audioConsumerIds}>{(consumerId) => (
					<RemoteClientAudio consumerId={consumerId} />
				)}
				</For>
			</Grid>
		</Grid>
	);
};

export default Monitor;
