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

export type PeerConnectionStatsProps = {
	peerConnectionId: string;
}

type HelperStruct = 
{ 
	key: string; 
	value: number | string | boolean | undefined; 
};


const PeerConnectionStatsProperties: Component<PeerConnectionStatsProps> = (props: PeerConnectionStatsProps) => {
	const [ properties, setProperties ] = createSignal<HelperStruct[]>([]);
	// eslint-disable-next-line no-unused-vars
	const getPropertyFromMonitor = <K extends keyof ClientMonitor['peerConnections'][number]>(key: K): HelperStruct => {
		const value = clientStore.call?.monitor.getPeerConnectionStats(props.peerConnectionId)?.[key];
		if (typeof value === 'object' || typeof value === 'function') {
			return { key, value: void 0 };
		}
		return { key, value };
	};
	const onChange = () => setProperties([
		getPropertyFromMonitor('peerConnectionId'),
		getPropertyFromMonitor('label'),
		getPropertyFromMonitor('receivingAudioBitrate'),
		getPropertyFromMonitor('receivingVideoBitrate'),
		getPropertyFromMonitor('sendingAudioBitrate'),
		getPropertyFromMonitor('sendingVideoBitrate'),
		getPropertyFromMonitor('avgRttInS'),

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

export default PeerConnectionStatsProperties;
