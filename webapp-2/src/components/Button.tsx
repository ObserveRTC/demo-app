import { Component, Show } from 'solid-js';
import { Spinner } from './Spinner';

type ButtonProps = {
	title?: string;
	disabled?: boolean;
	showSpinner?: boolean;
	onClick?: () => void;
}

const Button: Component<ButtonProps> = (props) => {
	return (
		<button
			onClick={ props.onClick }
			disabled={ props.disabled }
			class='flex w-full justify-center rounded-md bg-indigo-600 p-1.5 mt-4 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-slate-200'
		>
			<Show when={ props.showSpinner } fallback={ props.title }><Spinner /></Show>
		</button>
	);
};

export default Button;
