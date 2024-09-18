import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@suid/material';
import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { clientStore } from '../stores/LocalClientStore';
import { SimpleLineChart } from './Charts/SimpleLineChart';
import { SimpleLineCharts } from './Charts/SimpleLineCharts';

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

const StunnerBaseCharts: Component = () => {
	// const [ properties, setProperties ] = createSignal<HelperStruct[]>([]);
	const [ timestamps, setTimestamps ] = createSignal<number[]>([]);
	const [ memoryUsage, setMemoryUsage ] = createSignal<number[]>([]);
	const [ cpuUsage, setCpuUsage ] = createSignal<number[]>([]);
	const [ packetLatency, setPacketLatency ] = createSignal<number[]>([]);

	const onChange = () => {

		setTimestamps(windowedArray(timestamps(), Date.now()));
		setMemoryUsage(
			windowedArray(memoryUsage(), 0)
		);
		setCpuUsage(
			windowedArray(cpuUsage(), 0)
		);
		setPacketLatency(
			windowedArray(packetLatency(), 0)
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
								title={'memoryUsage'}
								xAxisName={'memoryUsage'}
								timestamps={timestamps()}
								series={[
									{ name: 'memoryUsage', values: memoryUsage() },
								]}
							/>
						</TableCell>
						<TableCell sx={{ width: '33%' }}>
							<SimpleLineCharts 
								title={'cpuUsage'}
								xAxisName={'cpuUsage'}
								timestamps={timestamps()}
								series={[
									{ name: 'cpuUsage', values: cpuUsage() },
								]}
							/>
							{/** RECEIVING BITRATE  + AVAILABLE INCOMING BITRATE */}
						</TableCell>

						<TableCell sx={{ width: '33%' }}>
							<SimpleLineChart
								title={'packetLatency'}
								xAxisName={'packetLatency'}
								info=""
								timestamps={timestamps()}
								values={packetLatency()}
							/>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default StunnerBaseCharts;
