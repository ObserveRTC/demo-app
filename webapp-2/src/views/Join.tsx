import { onMount, type Component, For, createSignal, Show } from 'solid-js';
import { connectObserverClient, joinToCall } from '../actions/actions';
import Box from '../components/Box';
import Button from '../components/Button';
import DeviceSelector from '../components/DeviceSelector';
import LocalClientVideo from '../components/LocalClientVideo';
import { CallConfig } from '../utils/Call';
import { clientStore, setClientStore, updateClientMedia } from '../stores/LocalClientStore';
import { ErrorPaperItem } from '../components/PaperItem';
import { setPage } from '../signals/signals';
import Configuration from '../components/Configuration';
import { TextField } from '@suid/material';

const Join: Component = () => {
	const [ error, setError ] = createSignal<string | undefined>();
	const [ inProgress, setInProgress ] = createSignal(false);
	const  [ callConfig, setCallConfig ] = createSignal<CallConfig>({
		monitor: {
			collectingPeriodInMs: 1000,
		},
		requestTimeoutInMs: 10000,
		serverUri: 'ws://localhost:9080',
		clientId: clientStore.clientId,
		callId: undefined,
	});
	onMount(() => updateClientMedia({}));

	return (
		<Box title="Join to a Call">
			<Show when={error()}>
				<ErrorPaperItem>{error()}</ErrorPaperItem>
			</Show>
			<LocalClientVideo />

			<DeviceSelector
				title='Select webcam'
				value={ clientStore.selectedVideoDeviceId }
				onChange={(e) => {
					updateClientMedia({ newVideoDeviceId: e.currentTarget.value });
				}}
				disabled={ clientStore.updateInProgress }
			>
				<For each={ clientStore.videoDevices }>
					{ ({ deviceId, label }) => <option value={ deviceId }>{ label }</option> }
				</For>
			</DeviceSelector>

			<DeviceSelector
				title='Select microphone'
				value={ clientStore.selectedAudioDeviceId }
				onChange={(e) => {
					updateClientMedia({ newAudioDeviceId: e.currentTarget.value });
				}}
				disabled={ clientStore.updateInProgress }
			>
				<For each={ clientStore.audioDevices }>
					{ ({ deviceId, label }) => <option value={ deviceId }>{ label }</option> }
				</For>
			</DeviceSelector>
			<TextField 
				label='CallId'
				value={callConfig().callId}
				onChange={(e) => setCallConfig({ ...callConfig(), callId: e.currentTarget.value })}
			/>
			<TextField 
				label='UserId'
				value={clientStore.userId}
				onChange={(e) => setClientStore({ ...clientStore, userId: e.currentTarget.value })}
			/>
			<Configuration setCallConfig={setCallConfig} getCallConfig={callConfig} />
			<Button
				title='Join'
				onClick={() => {
					setInProgress(true);
					joinToCall(callConfig())
						.then(() => {
							setClientStore({ ...clientStore, call: window.call });
							setPage('room');
						})
						.catch(setError)
						.finally(() => setInProgress(false));
				}}
				disabled={ clientStore.updateInProgress || inProgress() }
				showSpinner={ inProgress() }
			/>

			<Button
				title='Observe Calls'
				onClick={() => {
					setInProgress(true);
					connectObserverClient(callConfig())
						.then(() => {
							setPage('observer');
						})
						.catch(setError)
						.finally(() => setInProgress(false));
				}}
				disabled={ inProgress() }
				showSpinner={ inProgress() }
			/>
		</Box>
	);
};

export default Join;
