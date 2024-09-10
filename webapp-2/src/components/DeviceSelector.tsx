import { Component, JSX } from 'solid-js';

type DeviceSelectorProps = {
	title?: string;
	value?: string;
	onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
	disabled?: boolean;
	children?: JSX.Element;
};

const DeviceSelector: Component<DeviceSelectorProps> = (props) => {
	return (
		<>
			<label class='text-sm text-gray-700'>{ props.title }</label>
			<select
				value={ props.value }
				onChange={ props.onChange }
				disabled={ props.disabled }
				class='w-full p-2 rounded-md shadow-sm focus:outline-none'
			>
				{ props.children }
			</select>
		</>
	);
};

export default DeviceSelector;
