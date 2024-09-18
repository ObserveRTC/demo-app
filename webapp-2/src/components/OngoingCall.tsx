import { Component, createSignal, For, onCleanup, Show } from 'solid-js';
import { ObservedGetOngoingCallResponse, ObserverGetCallStatsResponse } from '../utils/MessageProtocol';
import { TableContainer, Paper, Table, TableBody, TableRow, TableCell, Button } from '@suid/material';
import Box from './Box';

type OngoingCallProps = ObservedGetOngoingCallResponse['calls'][number];

const Row: Component<{ label: string, value?: number | string, bold?: boolean, indent?: number }> = (props) => (
	<TableRow
		sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
	>
		<TableCell component="th" scope="row" style={`padding-left: ${props.indent ?? 0}em; width: 500px`}>
			{props.label}
		</TableCell>
		<TableCell align="left">
			{props.value}
		</TableCell>
	</TableRow>
);

const OngoingCall: Component<OngoingCallProps> = (props) => {
	const [ fetchedStats, setFetchedStats ] = createSignal<ObserverGetCallStatsResponse>();
	const [ selectedIds, setSelectedIds ] = createSignal<string[]>([]);
	const ShowButtonRow: Component<{ label: string, id: string }> = (props) => (
		<TableRow
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row">
				<b>{props.label} {props.id}</b>
			</TableCell>
			<TableCell align="left">
				<Button 
					onClick={() => {
						if (selectedIds().includes(props.id)) {
							setSelectedIds(selectedIds().filter(id => id !== props.id));
						} else {
							setSelectedIds([...selectedIds(), props.id]);
						}
					}}>{
						selectedIds().includes(props.id) ? 'Hide' : 'Show'
					}</Button>
			</TableCell>
		</TableRow>
	);

	const timer = setInterval(async () => {
		if (!window.call) return;

		const newFetchedStats = await window.call.getCallStats(props.callId);

		// console.warn('newFetchedStats', newFetchedStats);

		setFetchedStats(newFetchedStats);
	}, 1000);

	onCleanup(() => {
		clearInterval(timer);
	});
	return (
		<Box full={true} title={props.callId.slice(0, -8) + '********'}>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableBody>
						<Row label="Call Score" value={fetchedStats()?.callScore?.score} />
						<Row label="Call Score Remarks" value={fetchedStats()?.callScore?.remarks.map(r => r.text).join(', ')} />
						<For each={fetchedStats()?.clients}>
							{(client) => (
								<>
									<ShowButtonRow label="Client" id={client.clientId} />
									<Show when={selectedIds().includes(client.clientId)}>
										<Row label="Client Score" value={client.clientScore?.score} indent={1} />
										<Row label="Client Score Remarks" value={client.clientScore?.remarks.map(r => r.text).join(', ')}  indent={1}/>
										<For each={client.peerConnections}>{peerConnection => (
											<>
												<ShowButtonRow label="Peer Connection" id={peerConnection.peerConnectionId} />
												<Show when={selectedIds().includes(peerConnection.peerConnectionId)}>
													<Row label="Avg RTT [ms]" value={peerConnection.avgRttInMs} indent={2} />
													<For each={peerConnection.inboundAudioTracks}>{track => (
														<>
															<ShowButtonRow label="Inbound Audio Track" id={track.trackId} />
															<Show when={selectedIds().includes(track.trackId)}>
																<Row label="receivingBitrate" value={track?.receivingBitrate} indent={3} />
																<Row label="Lost Packets" value={track.totalLostPackets} indent={3} />
																<Row label="Score" value={track.trackScore?.score} indent={3} />
																<Row label="Remarks" value={track.trackScore?.remarks.map(r => r.text).join(', ')} indent={4} />
															</Show>
														</>
													)}
													</For>
													<For each={peerConnection.inboundVideoTracks}>{track => (
														<>
															<ShowButtonRow label="Inbound Video Track" id={track.trackId} />
															<Show when={selectedIds().includes(track.trackId)}>
																<Row label="receivingBitrate" value={track?.receivingBitrate} indent={3} />
																<Row label="Lost Packets" value={track.totalLostPackets} indent={3} />
																<Row label="Score" value={track.trackScore?.score} indent={3} />
																<Row label="Remarks" value={track.trackScore?.remarks.map(r => r.text).join(', ')} indent={3} />
															</Show>
														</>
													)}
													</For>
													<For each={peerConnection.outboundAudioTracks}>{track => (
														<>
															<ShowButtonRow label="Outbound Audio Track" id={track.trackId} />
															<Show when={selectedIds().includes(track.trackId)}>
																<Row label="sendingBitrate" value={track?.sendingBitrate} indent={3} />
																<Row label="Score" value={track.trackScore?.score} indent={3} />
																<Row label="Remarks" value={track.trackScore?.remarks.map(r => r.text).join(', ')} indent={3} />
															</Show>
														</>
													)}
													</For>
													<For each={peerConnection.outboundVideoTracks}>{track => (
														<>
															<ShowButtonRow label="Outbound Video Track" id={track.trackId} />
															<Show when={selectedIds().includes(track.trackId)}>
																<Row label="sendingBitrate" value={track?.sendingBitrate} indent={3} />
																<Row label="Score" value={track.trackScore?.score} indent={3} />
																<Row label="Remarks" value={track.trackScore?.remarks.map(r => r.text).join(', ')} indent={3} />
															</Show>
														</>
													)}
													</For>
												</Show>
											</>
										)}
										</For>
									</Show>
								</>
							)}
						</For>
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default OngoingCall;
