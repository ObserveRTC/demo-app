import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@suid/material';
import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import { SimpleLineChart } from '../Charts/SimpleLineChart';

// eslint-disable-next-line no-unused-vars
const WINDOW_SIZE = 60;
function windowedArray<T>(current: T[], newElement?: T) {
	if (!newElement) return [ ...current ];
	const result = [
		...current,
		newElement
	];
	while (WINDOW_SIZE < result.length) {
		result.shift();
	}

	return result;
}

const ClientMonitorStatsProperties: Component = () => {
	// const [ properties, setProperties ] = createSignal<HelperStruct[]>([]);
	const [ timestamps, setTimestamps ] = createSignal<number[]>([]);
	const [ deltaDataChannelBytesReceived, setDeltaDataChannelBytesReceived ] = createSignal<number[]>([]);
	const [ deltaDataChannelBytesSent, setDeltaDataChannelBytesSent ] = createSignal<number[]>([]);
	const [ deltaInboundPacketsLost, setDeltaInboundPacketsLost ] = createSignal<number[]>([]);
	const [ deltaInboundPacketsReceived, setDeltaInboundPacketsReceived ] = createSignal<number[]>([]);
	const [ deltaOutboundPacketsLost, setDeltaOutboundPacketsLost ] = createSignal<number[]>([]);
	const [ deltaOutboundPacketsReceived, setDeltaOutboundPacketsReceived ] = createSignal<number[]>([]);
	const [ deltaOutboundPacketsSent, setDeltaOutboundPacketsSent ] = createSignal<number[]>([]);
	const [ deltaReceivedAudioBytes, setDeltaReceivedAudioBytes ] = createSignal<number[]>([]);
	const [ deltaReceivedVideoBytes, setDeltaReceivedVideoBytes ] = createSignal<number[]>([]);
	const [ deltaSentAudioBytes, setDeltaSentAudioBytes ] = createSignal<number[]>([]);
	const [ deltaSentVideoBytes, setDeltaSentVideoBytes ] = createSignal<number[]>([]);
	const [ totalAvailableIncomingBitrate, setTotalAvailableIncomingBitrate ] = createSignal<number[]>([]);
	const [ totalAvailableOutgoingBitrate, setTotalAvailableOutgoingBitrate ] = createSignal<number[]>([]);
	const [ totalDataChannelBytesReceived, setTotalDataChannelBytesReceived ] = createSignal<number[]>([]);
	const [ totalDataChannelBytesSent, setTotalDataChannelBytesSent ] = createSignal<number[]>([]);
	const [ totalInboundPacketsLost, setTotalInboundPacketsLost ] = createSignal<number[]>([]);
	const [ totalInboundPacketsReceived, setTotalInboundPacketsReceived ] = createSignal<number[]>([]);
	const [ totalOutboundPacketsLost, setTotalOutboundPacketsLost ] = createSignal<number[]>([]);
	const [ totalOutboundPacketsReceived, setTotalOutboundPacketsReceived ] = createSignal<number[]>([]);
	const [ totalOutboundPacketsSent, setTotalOutboundPacketsSent ] = createSignal<number[]>([]);
	const [ totalReceivedAudioBytes, setTotalReceivedAudioBytes ] = createSignal<number[]>([]);
	const [ totalReceivedVideoBytes, setTotalReceivedVideoBytes ] = createSignal<number[]>([]);
	const [ totalSentAudioBytes, setTotalSentAudioBytes ] = createSignal<number[]>([]);
	const [ totalSentVideoBytes, setTotalSentVideoBytes ] = createSignal<number[]>([]);

	const onChange = () => {
		const call = clientStore.call;
		const monitor = call?.monitor;
		setTimestamps([...timestamps(), Date.now()]);
		setDeltaDataChannelBytesReceived(
			windowedArray(deltaDataChannelBytesReceived(), monitor?.deltaDataChannelBytesReceived)
		);
		setDeltaDataChannelBytesSent(
			windowedArray(deltaDataChannelBytesSent(), monitor?.deltaDataChannelBytesSent)
		);
		monitor?.deltaInboundPacketsLost &&
			setDeltaInboundPacketsLost([...deltaInboundPacketsLost(), monitor?.deltaInboundPacketsLost]);
		monitor?.deltaInboundPacketsReceived &&
			setDeltaInboundPacketsReceived([...deltaInboundPacketsReceived(), monitor?.deltaInboundPacketsReceived]);
		monitor?.deltaOutboundPacketsLost &&
			setDeltaOutboundPacketsLost([...deltaOutboundPacketsLost(), monitor?.deltaOutboundPacketsLost]);
		monitor?.deltaOutboundPacketsReceived &&
			setDeltaOutboundPacketsReceived([...deltaOutboundPacketsReceived(), monitor?.deltaOutboundPacketsReceived]);
		monitor?.deltaOutboundPacketsSent && 
			setDeltaOutboundPacketsSent([...deltaOutboundPacketsSent(), monitor?.deltaOutboundPacketsSent]);
		monitor?.deltaReceivedAudioBytes &&
			setDeltaReceivedAudioBytes([...deltaReceivedAudioBytes(), monitor?.deltaReceivedAudioBytes]);
		monitor?.deltaReceivedVideoBytes &&
			setDeltaReceivedVideoBytes([...deltaReceivedVideoBytes(), monitor?.deltaReceivedVideoBytes]);
		monitor?.deltaSentAudioBytes &&
			setDeltaSentAudioBytes([...deltaSentAudioBytes(), monitor?.deltaSentAudioBytes]);
		monitor?.deltaSentVideoBytes &&
			setDeltaSentVideoBytes([...deltaSentVideoBytes(), monitor?.deltaSentVideoBytes]);
		monitor?.totalAvailableIncomingBitrate &&
			setTotalAvailableIncomingBitrate([...totalAvailableIncomingBitrate(), monitor?.totalAvailableIncomingBitrate]);
		monitor?.totalAvailableOutgoingBitrate &&
			setTotalAvailableOutgoingBitrate([...totalAvailableOutgoingBitrate(), monitor?.totalAvailableOutgoingBitrate]);
		monitor?.totalDataChannelBytesReceived &&
			setTotalDataChannelBytesReceived([...totalDataChannelBytesReceived(), monitor?.totalDataChannelBytesReceived]);
		monitor?.totalDataChannelBytesSent &&
			setTotalDataChannelBytesSent([...totalDataChannelBytesSent(), monitor?.totalDataChannelBytesSent]);
		monitor?.totalInboundPacketsLost &&
			setTotalInboundPacketsLost([...totalInboundPacketsLost(), monitor?.totalInboundPacketsLost]);
		monitor?.totalInboundPacketsReceived &&
			setTotalInboundPacketsReceived([...totalInboundPacketsReceived(), monitor?.totalInboundPacketsReceived]);
		monitor?.totalOutboundPacketsLost &&
			setTotalOutboundPacketsLost([...totalOutboundPacketsLost(), monitor?.totalOutboundPacketsLost]);
		monitor?.totalOutboundPacketsReceived &&
			setTotalOutboundPacketsReceived([...totalOutboundPacketsReceived(), monitor?.totalOutboundPacketsReceived]);
		monitor?.totalOutboundPacketsSent &&
			setTotalOutboundPacketsSent([...totalOutboundPacketsSent(), monitor?.totalOutboundPacketsSent]);
		monitor?.totalReceivedAudioBytes &&
			setTotalReceivedAudioBytes([...totalReceivedAudioBytes(), monitor?.totalReceivedAudioBytes]);
		monitor?.totalReceivedVideoBytes &&
			setTotalReceivedVideoBytes([...totalReceivedVideoBytes(), monitor?.totalReceivedVideoBytes]);
		monitor?.totalSentAudioBytes &&	
			setTotalSentAudioBytes([...totalSentAudioBytes(), monitor?.totalSentAudioBytes]);
		monitor?.totalSentVideoBytes &&
			setTotalSentVideoBytes([...totalSentVideoBytes(), monitor?.totalSentVideoBytes]);
		
	};

	// const onChange = () => setProperties([
	// 	getPropertyFromMonitor('deltaDataChannelBytesReceived'),
	// 	getPropertyFromMonitor('deltaDataChannelBytesSent'),
	// 	getPropertyFromMonitor('deltaInboundPacketsLost'),
	// 	getPropertyFromMonitor('deltaInboundPacketsReceived'),
	// 	getPropertyFromMonitor('deltaOutboundPacketsLost'),
	// 	getPropertyFromMonitor('deltaOutboundPacketsReceived'),
	// 	getPropertyFromMonitor('deltaOutboundPacketsSent'),
	// 	getPropertyFromMonitor('deltaReceivedAudioBytes'),
	// 	getPropertyFromMonitor('deltaReceivedVideoBytes'),
	// 	getPropertyFromMonitor('deltaSentAudioBytes'),
	// 	getPropertyFromMonitor('deltaSentVideoBytes'),

	// 	getPropertyFromMonitor('totalAvailableIncomingBitrate'),
	// 	getPropertyFromMonitor('totalAvailableOutgoingBitrate'),
	// 	getPropertyFromMonitor('totalDataChannelBytesReceived'),
	// 	getPropertyFromMonitor('totalDataChannelBytesSent'),
	// 	getPropertyFromMonitor('totalInboundPacketsLost'),
	// 	getPropertyFromMonitor('totalInboundPacketsReceived'),
	// 	getPropertyFromMonitor('totalOutboundPacketsLost'),
	// 	getPropertyFromMonitor('totalOutboundPacketsReceived'),
	// 	getPropertyFromMonitor('totalOutboundPacketsSent'),
	// 	getPropertyFromMonitor('totalReceivedAudioBytes'),
	// 	getPropertyFromMonitor('totalReceivedVideoBytes'),
	// 	getPropertyFromMonitor('totalSentAudioBytes'),
	// 	getPropertyFromMonitor('totalSentVideoBytes'),
	// ]);
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

					{/** MEDIA BITRATES */}

					<TableRow
						sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
					>
						<TableCell sx={{ width: 200 }}>
							{/** SENDING BITRATE + AVAILABLE OUTGOING BITRATE */}
						</TableCell>
						<TableCell sx={{ width: 200 }}>
							{/** RECEIVING BITRATE  + AVAILABLE INCOMING BITRATE */}
						</TableCell>

						<TableCell sx={{ width: 200 }}>
							{/** RTT, JITTER */}
						</TableCell>
					</TableRow>
					

					{/** MEDIA PACKETS ROW */}
					
					<TableRow
						sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
					>
						<TableCell sx={{ width: 200 }}>
							<SimpleLineChart
								title={'mediaPacketsSent'}
								xAxisName={'mediaPacketsSent'}
								info="deltaOutboundPacketsSent"
								timestamps={timestamps()}
								values={deltaOutboundPacketsSent()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets sent',
									buttonAltFalseTitle: 'Switch to delta amount of packets sent',
									info: 'totalOutboundPacketsSent',
									values: totalOutboundPacketsSent(),
								}}
							/>
						</TableCell>
						<TableCell sx={{ width: 200 }}>
							<SimpleLineChart
								title={'mediaPacketsReceived'}
								xAxisName={'mediaPacketsReceived'}
								info="deltaInboundPacketsReceived"
								timestamps={timestamps()}
								values={deltaInboundPacketsReceived()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets received',
									buttonAltFalseTitle: 'Switch to delta amount of packets received',
									info: 'totalOutboundPacketsReceived',
									values: totalOutboundPacketsReceived(),
								}}
							/>
						</TableCell>

						<TableCell sx={{ width: 200 }}>
							<SimpleLineChart
								title={'lostMediaPackets'}
								xAxisName={'deltaDataChannelBytesSent'}
								info="dataChannelBytesSent"
								timestamps={timestamps()}
								values={deltaOutboundPacketsLost()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of media packets lost',
									buttonAltFalseTitle: 'Switch to delta amount of media packets lost',
									info: 'totalOutboundPacketsLost',
									values: totalOutboundPacketsLost(),
								}}
							/>
						</TableCell>
					</TableRow>
					
					{/** DATA CHANNEL PACKETS  ROW */}
					
					<TableRow>
						<TableCell sx={{ width: 200 }}>
							<SimpleLineChart
								title={'dataChannelBytesSent'}
								xAxisName={'deltaDataChannelBytesSent'}
								info="dataChannelBytesSent"
								timestamps={timestamps()}
								values={deltaDataChannelBytesSent()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets sent',
									buttonAltFalseTitle: 'Switch to delta amount of packets sent',
									info: 'totalDataChannelBytesSent',
									values: totalDataChannelBytesSent(),
								}}
							/>
						</TableCell>
						<TableCell sx={{ width: 200 }}>
							<SimpleLineChart
								title={'dataChannelBytesReceived'}
								xAxisName={'dataChannelBytesReceived'}
								info="dataChannelBytesReceived"
								timestamps={timestamps()}
								values={deltaDataChannelBytesReceived()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets received',
									buttonAltFalseTitle: 'Switch to delta amount of packets received',
									info: 'totalDataChannelBytesReceived',
									values: totalDataChannelBytesReceived(),
								}}
							/>
						</TableCell>
						
						<TableCell sx={{ width: 200 }} />

					</TableRow>
					{/* <For each={Object.entries(chartProperties())}>
						{([key, values]) => (
							<TableRow
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									<SimpleLineChart
										title={key}
										xAxisName={key}
										yAxisName="value"
										timestamps={timestamps()}
										values={values}
									/>
								</TableCell>
							</TableRow>
						)}
					</For> */}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default ClientMonitorStatsProperties;
