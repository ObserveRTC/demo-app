import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@suid/material';
import { Component, For, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';

type HelperStruct = 
{ 
	key: string; 
	value: number | string | boolean | undefined; 
};
// eslint-disable-next-line no-unused-vars

const ClientMonitorStateProperties: Component = () => {
	const [ properties, setProperties ] = createSignal<HelperStruct[]>([]);
	const onChange = () => setProperties([
		{ key: 'clientId', value: clientStore.clientId },
		{ key: 'userId', value: clientStore.userId },
		{ key: 'operationSystem', value: void 0 },
		{ key: 'operationSystem.name', value: clientStore.call?.monitor?.operationSystem?.name },
		{ key: 'operationSystem.version', value: clientStore.call?.monitor?.operationSystem?.version },
		{ key: 'browser', value: void 0 },
		{ key: 'browser.name', value: clientStore.call?.monitor?.browser?.name },
		{ key: 'browser.version', value: clientStore.call?.monitor?.browser?.version },
		{ key: 'engine', value: void 0 },
		{ key: 'engine.name', value: clientStore.call?.monitor?.engine?.name },
		{ key: 'engine.version', value: clientStore.call?.monitor?.engine?.version },
	]);
	onMount(() => {
		clientStore.call?.monitor?.on('stats-collected', onChange);
	});
	onCleanup(() => {
		clientStore.call?.monitor?.off('stats-collected', onChange);
		
	});
	return (
		<TableContainer component={Paper}>
			<Table aria-label="simple table">
				{/* <TableHead>
					<TableRow>
						<TableCell>Property</TableCell>
						<TableCell>value</TableCell>
					</TableRow>
				</TableHead> */}
				<TableBody>
					<For each={properties()}>
						{(row) => (
							<TableRow
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{`monitor.${row.key}`}
								</TableCell>
								<TableCell align="left">{row.value}</TableCell>
							</TableRow>
						)}
					</For>
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default ClientMonitorStateProperties;
