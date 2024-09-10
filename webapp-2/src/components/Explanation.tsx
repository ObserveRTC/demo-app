import { Component } from 'solid-js';

type ExplanationProps = {
	text: string;
};

const Explanation: Component<ExplanationProps> = (props) => {
	return (
		<div class='mx-4 text-sm text-gray-600'>
			{ props.text }
		</div>
	);
};

export default Explanation;
