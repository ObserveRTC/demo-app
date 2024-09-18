import { Component, createSignal, For, onCleanup } from 'solid-js';
import { ObservedGetOngoingCallResponse } from '../utils/MessageProtocol';
import { Button } from '@suid/material';
import { PaperItem } from '../components/PaperItem';
import Box from '../components/Box';
import { Accordion } from '../components/Accordion/Accordion';
import OngoingCall from '../components/OngoingCall';

// const TestResults = lazy(() => import('../components/TestResults'));

const ObserverView: Component = () => {
	const [ ongoingCalls, setOngoingCalls ] = createSignal<ObservedGetOngoingCallResponse['calls']>([]);
	const [ selectedCall, setSelectedCall ] = createSignal<ObservedGetOngoingCallResponse['calls'][number] | null>(null);
	const timer = setInterval(async () => {
		if (!window.call) return;

		const { calls } = await window.call.getOngoingCalls();

		setOngoingCalls(calls);
	}, 1000);

	onCleanup(() => {
		clearInterval(timer);
	});

	return (
		<Box title="Ongoing Calls" full={true}>
			<For each={ ongoingCalls() }>{call => (
				<Accordion title={call.callId.slice(0, -8) + '********'} open={selectedCall()?.callId === call.callId} onOpen={() => setSelectedCall(call)}>
					<OngoingCall {...call} />
				</Accordion>
			)}
			</For>
		</Box>
			
	);
};

export default ObserverView;
