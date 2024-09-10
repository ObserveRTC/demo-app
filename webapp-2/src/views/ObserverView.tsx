import { Component, createSignal, For, onCleanup, Show } from 'solid-js';
import { ObservedGetOngoingCallResponse } from '../utils/MessageProtocol';
import OngoingCall from '../components/OngoingCall';
import { Button, Grid } from '@suid/material';
import { PaperItem } from '../components/PaperItem';
import Box from '../components/Box';

// const TestResults = lazy(() => import('../components/TestResults'));

const ObserverView: Component = () => {
	const [ ongoingCalls, setOngoingCalls ] = createSignal<ObservedGetOngoingCallResponse['calls']>([]);
	const [ selectedCall, setSelectedCall ] = createSignal<ObservedGetOngoingCallResponse['calls'][number] | null>(null);
	const timer = setInterval(async () => {
		if (!window.observerClient) return;

		const { calls } = await window.observerClient.getOngoingCalls();

		setOngoingCalls(calls);
	}, 1000);

	onCleanup(() => {
		clearInterval(timer);
	});

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<PaperItem>Observe Calls</PaperItem>
			</Grid>
			<Grid item xs={8}>
				<Show when={selectedCall() !== null} fallback={'asdasdas'}>
					<OngoingCall {...selectedCall()!} />
				</Show>
			</Grid>
			<Grid item xs={4}>

				<For each={ ongoingCalls() }>{call => (
					<Box full={true}>
						<PaperItem>
							{call.callId}
							<Button onClick={() => {
								if (selectedCall()?.callId === call.callId) {
									setSelectedCall(null);
								} else {
									setSelectedCall(call);
								}
							}}>{selectedCall()?.callId === call.callId ? 'Hide' : 'Show'}</Button>
						</PaperItem>
					</Box>
				)}
				</For>
			</Grid>
		</Grid>
	);
};

export default ObserverView;
