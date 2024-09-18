import { EChartsAutoSize } from 'echarts-solid';
import { createSignal } from 'solid-js';

export type SimpleLineChartProps = {
	title?: string,
	xAxisName: string,
	info: string,
	timestamps: number[],
	values: number[],
	showDelta?: boolean,
	alternate?: {
		info: string,
		buttonAltTrueTitle: string,
		buttonAltFalseTitle: string,
		values: number[],
	}
};

export function SimpleLineChart(props: SimpleLineChartProps) {
	// eslint-disable-next-line solid/reactivity
	const [ alted, setAlted ] = createSignal(false);
	const getValues = () => props.values.map((value) => Math.round(value * 100) / 100);
	const getAltValues = () => props.alternate?.values.map((value) => Math.round(value * 100) / 100);
	const altInfo = () => {
		if (alted()) {
			if (props.alternate?.info) return `(${props.alternate?.info})`;
			else return '';
		} else {
			if (props.info) return `(${props.info})`;
			else return '';
		}
	};
	console.warn('SimpleLineChart', props);
	return (
		<div class='h-64'>
			<EChartsAutoSize option={{
				title: {
					text: `${props.title} ${altInfo()}`,
					left: 'center',
				},
				tooltip: {
					trigger: 'axis',
					formatter: function(params: unknown) {
						const dataItem = params as { dataIndex: number }[];
						const timestamp = props.timestamps[dataItem[0].dataIndex];
						const value = Math.round(props.values[dataItem[0].dataIndex] * 100) / 100;
						
						// console.warn('dataItem', dataItem);

						return `${value} at ${new Date(timestamp).toLocaleString()}`;
					}
				},
				xAxis: {
					type: 'category',
					data: props.timestamps,
					axisLabel: {
						formatter: function(value: string) {
							return new Date(parseInt(value)).toLocaleTimeString();
						}
					}
				},
				yAxis: {
					// interval: 5,
					type: 'value',
					// boundaryGap: [0, '50%'],\nameLocation: 'middle', // Places the name in the middle of the axis
					nameRotate: 90, // Rotates the yAxis name to be vertical
					nameTextStyle: {
						fontSize: 12, // Adjust the font size if needed
						align: 'right', // Keeps the name centered
					},
				},
				series: [
					alted() ? {
						smooth: true,
						name: props.xAxisName,
						type: 'line',
						data: getAltValues(),
					} : {
						smooth: true,
						name: props.xAxisName,
						type: 'line',
						data: getValues(),
					},
				],
				toolbox: props.alternate ? {
					feature: {
						myCustomButton:  {
							show: true,
							title: 
							alted() ? props.alternate?.buttonAltTrueTitle : props.alternate?.buttonAltFalseTitle,
							// icon: 'path://M0,0L15,15M0,15L15,0',
							icon: 'path://M16 2H8c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2V4c0-1.1-.9-2-2-2z M9 2h6v4H9V2z',

							onclick: function () {
								// Custom action triggered when the button is clicked
								setAlted(!alted());
							},
						},
					},
					show: true, // Display the toolbox
				}  : undefined,
			}} />
		</div>
	);
}