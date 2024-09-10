import { Component, JSX } from 'solid-js';

type MyTextFieldProps = {
	title?: string;
	value?: string;
	onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;
	disabled?: boolean;
};

const MyTextField: Component<MyTextFieldProps> = (props) => {
	return (
		<>
			<label class='text-sm text-gray-700'>{ props.title }</label>
			<input
				type="text"
				value={ props.value }
				onChange={ props.onChange}
				disabled={ props.disabled }
				class='w-full p-2 rounded-md shadow-sm focus:outline-none'
			/>
		</>
	);
};

export default MyTextField;
