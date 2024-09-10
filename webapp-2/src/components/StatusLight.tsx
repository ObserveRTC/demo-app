import { Component } from 'solid-js';

type StatusLightProps = {
	title?: string;
	state: 'none' | 'success' | 'warning' | 'error';
};

const StatusLight: Component<StatusLightProps> = (props) => {
	return (
		<div class='flex flex-row items-center space-x-2'>
			<div class={`w-4 h-4 rounded-full shadow-md ${
				props.state === 'none' ? 'bg-slate-500'
					: props.state === 'success' ? 'bg-green-500'
						: props.state === 'warning' ? 'bg-yellow-500'
							: 'bg-red-500'
			}`}/>
			<p class='text-sm'>{props.title}</p>
		</div>
	);
};

export default StatusLight;
