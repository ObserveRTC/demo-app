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
import { ClientMonitor } from '@observertc/client-monitor-js';
type HelperStruct = 
{ 
	key: string; 
	value: number | string | boolean | undefined; 
};
// eslint-disable-next-line no-unused-vars
function getPropertyFromMonitor<K extends keyof ClientMonitor>(key: K): HelperStruct {
	const value = clientStore.call?.monitor[key];
	if (typeof value === 'object' || typeof value === 'function') {
		return { key, value: void 0 };
	}
	return { key, value };
}

const ClientMonitorStatsProperties: Component = () => {
	const [ properties, setProperties ] = createSignal<HelperStruct[]>([]);
	const onChange = () => setProperties([
		getPropertyFromMonitor('deltaDataChannelBytesReceived'),
		getPropertyFromMonitor('deltaDataChannelBytesSent'),
		getPropertyFromMonitor('deltaInboundPacketsLost'),
		getPropertyFromMonitor('deltaInboundPacketsReceived'),
		getPropertyFromMonitor('deltaOutboundPacketsLost'),
		getPropertyFromMonitor('deltaOutboundPacketsReceived'),
		getPropertyFromMonitor('deltaOutboundPacketsSent'),
		getPropertyFromMonitor('deltaReceivedAudioBytes'),
		getPropertyFromMonitor('deltaReceivedVideoBytes'),
		getPropertyFromMonitor('deltaSentAudioBytes'),
		getPropertyFromMonitor('deltaSentVideoBytes'),

		getPropertyFromMonitor('totalAvailableIncomingBitrate'),
		getPropertyFromMonitor('totalAvailableOutgoingBitrate'),
		getPropertyFromMonitor('totalDataChannelBytesReceived'),
		getPropertyFromMonitor('totalDataChannelBytesSent'),
		getPropertyFromMonitor('totalInboundPacketsLost'),
		getPropertyFromMonitor('totalInboundPacketsReceived'),
		getPropertyFromMonitor('totalOutboundPacketsLost'),
		getPropertyFromMonitor('totalOutboundPacketsReceived'),
		getPropertyFromMonitor('totalOutboundPacketsSent'),
		getPropertyFromMonitor('totalReceivedAudioBytes'),
		getPropertyFromMonitor('totalReceivedVideoBytes'),
		getPropertyFromMonitor('totalSentAudioBytes'),
		getPropertyFromMonitor('totalSentVideoBytes'),
	]);
	onMount(() => {
		clientStore.call?.monitor?.on('stats-collected', onChange);
	});
	onCleanup(() => {
		clientStore.call?.monitor?.off('stats-collected', onChange);
	});
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
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

export default ClientMonitorStatsProperties;
