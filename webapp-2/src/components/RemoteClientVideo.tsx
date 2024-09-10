import { Component, createEffect, createResource, createSignal, onCleanup, For } from 'solid-js';
import { clientStore } from '../stores/LocalClientStore';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@suid/material';

const logger = console;

type HelperStruct = 
{ 
	key: string; 
	value: number | string | boolean | undefined; 
};

const RemoteClientVideo: Component<{ consumerId: string }> = (props) => {
	let mediaRef: HTMLVideoElement;
	const [ videoAction, setVideoAction ] = createSignal<'resume' | 'pause'>('resume');
	createResource(videoAction, async (consumerAction) => {
		const call = clientStore.call;
		const consumer = call?.mediaConsumers.get(props.consumerId);

		if (!consumer) return logger.warn(`Consumer ${props.consumerId} not found`);

		logger.debug(`Consumer ${consumer.id} ${consumerAction}`);

		consumer[consumerAction]();
	});
	const [ properties, setProperties ] = createSignal<HelperStruct[]>([]);

	createEffect(() => {
		const call = clientStore.call;
		const consumer = call?.mediaConsumers.get(props.consumerId);

		if (!consumer) return logger.warn(`Consumer ${props.consumerId} not found`);
		
		mediaRef.srcObject = new MediaStream([ consumer.track ]);

		setProperties([
			{ key: 'clientId', value: consumer.appData.clientId },
			{ key: 'userId', value: consumer.appData.userId },
		]);
	});

	onCleanup(() => {
		mediaRef.srcObject = null;
		mediaRef.onplay = null;
		mediaRef.onpause = null;
	});

	return (
		<>
			<video ref={ mediaRef! } class='w-full aspect-[16/9] rounded-lg overflow-hidden shadow-sm' autoplay playsinline muted />
			<Button onClick={ () => setVideoAction(videoAction() === 'pause' ? 'resume' : 'pause') }>
				{ videoAction() === 'pause' ? 'resume' : 'pause' }
			</Button>
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableBody>
						<For each={properties()}>
							{(row) => (
								<TableRow
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										{`${row.key}`}
									</TableCell>
									<TableCell align="left">{row.value}</TableCell>
								</TableRow>
							)}
						</For>
					</TableBody>
				</Table>
			</TableContainer>
		</>
		
	);
};

export default RemoteClientVideo;
