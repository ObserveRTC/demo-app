import { Component, JSX } from 'solid-js';

type BoxProps = {
	title?: string;
	logo?: string;
	children?: JSX.Element;
	full?: boolean;
}

const Box: Component<BoxProps> = (props) => {
	const divClass = [
		'mt-8 mx-4 sm:mx-auto',
		props.full ? 'sm:w-full' : 'sm:max-w-sm',
	].join(' ');
	// sm:max-w-sm
	return (
		<div class={divClass}>
			<div class='flex flex-col bg-white p-4 shadow-md rounded-lg gap-2'>
				<h2 class='text-center text-2xl font-bold text-gray-900'>{ props.title }</h2>
				{ props.children }
			</div>
		</div>
	);
};

export default Box;
