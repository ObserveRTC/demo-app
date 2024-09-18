import { EChartsAutoSize } from 'echarts-solid';

export type SimpleLineChartsProps = {
	title?: string,
	xAxisName: string,
	timestamps: number[],
	series: {
		name: string,
		values: number[],
	}[];
	// values: number[],
	// values2?: number[],
	// values3?: number[],
	// values4?: number[],
	showDelta?: boolean,
};

export function SimpleLineCharts(props: SimpleLineChartsProps) {
	// eslint-disable-next-line solid/reactivity
	return (
		<div class='h-64'>
			<EChartsAutoSize option={{
				legend: {
					// Try 'horizontal'
					orient: 'vertical',
					right: 10,
					top: 'left',

					// data: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
				},
				title: {
					text: `${props.title}`,
					left: 'center',
				},
				tooltip: {
					trigger: 'axis',
					formatter: function(params: unknown) {
						const dataItem = params as { dataIndex: number }[];
						const timestamp = props.timestamps[dataItem[0].dataIndex];
						// const value = Math.round(props.values[dataItem[0].dataIndex] * 100) / 100;
						const value = props.series.map((serie) => `${serie.name}: ${serie.values[dataItem[0].dataIndex]}`).join('<br />');
						
						// console.warn('dataItem', dataItem);

						return `At ${new Date(timestamp).toLocaleString()}<br />${value}`;
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
					// nameRotate: 90, // Rotates the yAxis name to be vertical
					// nameTextStyle: {
					// 	fontSize: 12, // Adjust the font size if needed
					// 	align: 'right', // Keeps the name centered
					// },
				},
				series: props.series.map((serie) => ({
					smooth: true,
					name: serie.name,
					type: 'line',
					data: serie.values.map((value) => Math.round(value * 100) / 100),
					// itemStyle: { color: 'blue' },
				})),
			}} />
		</div>
	);
}