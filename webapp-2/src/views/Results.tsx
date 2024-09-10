import { Component, createEffect, createSignal } from 'solid-js';
import Box from '../components/Box';
import {
	availableOutgoingBitrates,
	highLatency,
	highPacketLoss,
	incomingBitrate,
	lowBandwidth,
	outgoingBitrate,
	packetLoss,
	participantId,
	rtt,
	slugId,
	usingRelay,
	usingTCP,
} from '../signals/signals';

// const TestResults = lazy(() => import('../components/TestResults'));

const Completed: Component = () => {
	const [ completeResults, setCompleteResults ] = createSignal();
	const [ url, setUrl ] = createSignal<string | undefined>();

	createEffect(() => {
		setCompleteResults({
			participantId: participantId(),
			slugId: slugId(),
			// testResults: testResults,
			incomingBitrate: [ ...incomingBitrate() ],
			outgoingBitrate: [ ...outgoingBitrate() ],
			availableOutgoingBitrates: [ ...availableOutgoingBitrates() ],
			packetLoss: [ ...packetLoss() ],
			rtt: [ ...rtt() ],
			usingRelay: usingRelay(),
			usingTCP: usingTCP(),
			lowBandwidth: lowBandwidth(),
			highPacketLoss: highPacketLoss(),
			highLatency: highLatency(),
		});

		const blob = new Blob([ JSON.stringify(completeResults()) ], { type: 'application/json' });
		setUrl(URL.createObjectURL(blob));
	});

	return (
		<Box title='✓ Test done'>
			{/* <TestResults showExplanation={ true } /> */}
			<div class='flex w-full justify-center'>
				<a
					class='flex w-full justify-center rounded-md bg-indigo-600 p-1.5 m-1 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-slate-200'
					download='test-results.json'
					href={ url() }
				>
					Save results
				</a>
			</div>
		</Box>
	);
};

export default Completed;
