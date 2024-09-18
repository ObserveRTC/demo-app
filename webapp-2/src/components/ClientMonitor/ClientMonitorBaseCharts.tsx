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
import { SimpleLineCharts } from '../Charts/SimpleLineCharts';

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

const ClientMonitorBaseCharts: Component = () => {
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
	const [ totalAvailableIncomingKbps, setTotalAvailableIncomingKbps ] = createSignal<number[]>([]);
	const [ totalAvailableOutgoingKbps, setTotalAvailableOutgoingKbps ] = createSignal<number[]>([]);
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
	const [ avgRttInMs, setAvgRttInMs ] = createSignal<number[]>([]);
	const [ sendingKbps, setSendingKbps ] = createSignal<number[]>([]);
	const [ receivingKbps, setReceivingKbps ] = createSignal<number[]>([]);

	const onChange = () => {
		const call = clientStore.call;
		const monitor = call?.monitor;

		setTimestamps(windowedArray(timestamps(), Date.now()));
		setDeltaDataChannelBytesReceived(
			windowedArray(deltaDataChannelBytesReceived(), monitor?.deltaDataChannelBytesReceived)
		);
		setDeltaDataChannelBytesSent(
			windowedArray(deltaDataChannelBytesSent(), monitor?.deltaDataChannelBytesSent)
		);
		setDeltaInboundPacketsLost(
			windowedArray(deltaInboundPacketsLost(), monitor?.deltaInboundPacketsLost)
		);
		setDeltaInboundPacketsReceived(
			windowedArray(deltaInboundPacketsReceived(), monitor?.deltaInboundPacketsReceived)
		);
		setDeltaOutboundPacketsLost(
			windowedArray(deltaOutboundPacketsLost(), monitor?.deltaOutboundPacketsLost)
		);
		setDeltaOutboundPacketsReceived(
			windowedArray(deltaOutboundPacketsReceived(), monitor?.deltaOutboundPacketsReceived)
		);
		setDeltaOutboundPacketsSent(
			windowedArray(deltaOutboundPacketsSent(), monitor?.deltaOutboundPacketsSent)
		);
		setDeltaReceivedAudioBytes(
			windowedArray(deltaReceivedAudioBytes(), monitor?.deltaReceivedAudioBytes)
		);
		setDeltaReceivedVideoBytes(
			windowedArray(deltaReceivedVideoBytes(), monitor?.deltaReceivedVideoBytes)
		);
		setDeltaSentAudioBytes(
			windowedArray(deltaSentAudioBytes(), monitor?.deltaSentAudioBytes)
		);
		setDeltaSentVideoBytes(
			windowedArray(deltaSentVideoBytes(), monitor?.deltaSentVideoBytes)
		);
		setTotalAvailableIncomingKbps(
			windowedArray(totalAvailableIncomingKbps(), (monitor?.totalAvailableIncomingBitrate ?? 0) / 1000)
		);
		setTotalAvailableOutgoingKbps(
			windowedArray(totalAvailableOutgoingKbps(), (monitor?.totalAvailableOutgoingBitrate ?? 0) / 1000)
		);
		setTotalDataChannelBytesReceived(
			windowedArray(totalDataChannelBytesReceived(), monitor?.totalDataChannelBytesReceived)
		);
		setTotalDataChannelBytesSent(
			windowedArray(totalDataChannelBytesSent(), monitor?.totalDataChannelBytesSent)
		);
		setTotalInboundPacketsLost(
			windowedArray(totalInboundPacketsLost(), monitor?.totalInboundPacketsLost)
		);
		setTotalInboundPacketsReceived(
			windowedArray(totalInboundPacketsReceived(), monitor?.totalInboundPacketsReceived)
		);
		setTotalOutboundPacketsLost(
			windowedArray(totalOutboundPacketsLost(), monitor?.totalOutboundPacketsLost)
		);
		setTotalOutboundPacketsReceived(
			windowedArray(totalOutboundPacketsReceived(), monitor?.totalOutboundPacketsReceived)
		);
		setTotalOutboundPacketsSent(
			windowedArray(totalOutboundPacketsSent(), monitor?.totalOutboundPacketsSent)
		);
		setTotalReceivedAudioBytes(
			windowedArray(totalReceivedAudioBytes(), monitor?.totalReceivedAudioBytes)
		);
		setTotalReceivedVideoBytes(
			windowedArray(totalReceivedVideoBytes(), monitor?.totalReceivedVideoBytes)
		);
		setTotalSentAudioBytes(
			windowedArray(totalSentAudioBytes(), monitor?.totalSentAudioBytes)
		);
		setTotalSentVideoBytes(
			windowedArray(totalSentVideoBytes(), monitor?.totalSentVideoBytes)
		);
		setAvgRttInMs(
			windowedArray(avgRttInMs(), (monitor?.avgRttInSec ?? 0) * 1000)
		);
		setSendingKbps(
			windowedArray(sendingKbps(), ((monitor?.sendingAudioBitrate ?? 0) + (monitor?.sendingVideoBitrate ?? 0)) / 1000)
		);
		setReceivingKbps(
			windowedArray(receivingKbps(), ((monitor?.receivingAudioBitrate ?? 0) + (monitor?.receivingVideoBitrate ?? 0)) / 1000)
		);
		
	};

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
						<TableCell sx={{ width: '33%' }}>
							<SimpleLineCharts 
								title={'sendingKbps'}
								xAxisName={'sendingKbps'}
								timestamps={timestamps()}
								series={[
									{ name: 'sendingKbps', values: sendingKbps() },
									{ name: 'totalAvailableOutgoingKbps', values: totalAvailableOutgoingKbps() },
								]}
							/>
							{/** SENDING BITRATE + AVAILABLE OUTGOING BITRATE */}
						</TableCell>
						<TableCell sx={{ width: '33%' }}>
							<SimpleLineCharts 
								title={'receivingKbps'}
								xAxisName={'receivingKbps'}
								timestamps={timestamps()}
								series={[
									{ name: 'receivingKbps', values: receivingKbps() },
									{ name: 'totalAvailableIncomingKbps', values: totalAvailableIncomingKbps() },
								]}
							/>
							{/** RECEIVING BITRATE  + AVAILABLE INCOMING BITRATE */}
						</TableCell>

						<TableCell sx={{ width: '33%' }}>
							<SimpleLineChart
								title={'avgRttInMs'}
								xAxisName={'avgRttInMs'}
								info=""
								timestamps={timestamps()}
								values={avgRttInMs()}
							/>
						</TableCell>
					</TableRow>
					

					{/** MEDIA PACKETS ROW */}
					
					<TableRow
						sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
					>
						<TableCell sx={{ width: '33%' }}>
							<SimpleLineChart
								title={'mediaPacketsSent'}
								xAxisName={'mediaPacketsSent'}
								info="incremental"
								timestamps={timestamps()}
								values={deltaOutboundPacketsSent()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets sent',
									buttonAltFalseTitle: 'Switch to delta amount of packets sent',
									info: 'total',
									values: totalOutboundPacketsSent(),
								}}
							/>
						</TableCell>
						<TableCell sx={{ width: '33%' }}>
							<SimpleLineChart
								title={'mediaPacketsReceived'}
								xAxisName={'mediaPacketsReceived'}
								info="incremental"
								timestamps={timestamps()}
								values={deltaInboundPacketsReceived()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets received',
									buttonAltFalseTitle: 'Switch to delta amount of packets received',
									info: 'total',
									values: totalInboundPacketsReceived(),
								}}
							/>
						</TableCell>

						<TableCell sx={{ width: '33%' }} >
							<SimpleLineChart
								title={'lostMediaPackets'}
								xAxisName={'deltaDataChannelBytesSent'}
								info="incremental"
								timestamps={timestamps()}
								values={deltaOutboundPacketsLost()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of media packets lost',
									buttonAltFalseTitle: 'Switch to delta amount of media packets lost',
									info: 'total',
									values: totalOutboundPacketsLost(),
								}}
							/>
						</TableCell>
						
					</TableRow>
					
					{/** DATA CHANNEL PACKETS  ROW */}
					
					<TableRow>

						<TableCell sx={{ width: '33%' }}>
							
						</TableCell>

						<TableCell sx={{ width: '33%' }}>
							<SimpleLineChart
								title={'dataChannelBytesSent'}
								xAxisName={'deltaDataChannelBytesSent'}
								info="incremental"
								timestamps={timestamps()}
								values={deltaDataChannelBytesSent()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets sent',
									buttonAltFalseTitle: 'Switch to delta amount of packets sent',
									info: 'total',
									values: totalDataChannelBytesSent(),
								}}
							/>
						</TableCell>
						<TableCell sx={{ width: '33%' }}>
							<SimpleLineChart
								title={'dataChannelBytesReceived'}
								xAxisName={'dataChannelBytesReceived'}
								info="dataChannelBytesReceived"
								timestamps={timestamps()}
								values={deltaDataChannelBytesReceived()}
								alternate={{
									buttonAltTrueTitle: 'Switch to total amount of packets received',
									buttonAltFalseTitle: 'Switch to delta amount of packets received',
									info: 'total',
									values: totalDataChannelBytesReceived(),
								}}
							/>
						</TableCell>
						
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

export default ClientMonitorBaseCharts;
