/* eslint-disable no-unused-vars */
import { Component, createSignal, JSX, Show } from 'solid-js';
import { ConnectionConfig } from '../utils/Connection';
import { ErrorPaperItem } from './PaperItem';
import { Accordion } from './Accordion/Accordion';

type ConfigurationProps = {
	children?: JSX.Element;
	getCallConfig: () => ConnectionConfig;
	setCallConfig: (config: ConnectionConfig) => void;
};

const Configuration: Component<ConfigurationProps> = (props) => {
	const { getCallConfig, setCallConfig } = props;
	const [ error, setError ] = createSignal<string | undefined>();
	
	return (
		<Accordion title="Monitor Configuration">
			<Show when={error()}>
				<ErrorPaperItem>{error()}</ErrorPaperItem>
			</Show>
			{/* <label class='text-sm text-gray-700'>Monitor Configuration</label> */}
			<textarea
				class='text-sm text-gray-700 border-gray-900' rows="4" cols="40"
				onChange={(e) => {
					try {
						const monitor = JSON.parse(e.currentTarget.value);
						setError(undefined);
						setCallConfig({
							...getCallConfig(),
							monitor,
						});
					} catch (err) {
						setError(`${err}`);
					}
				}}
				// class='w-full p-2 rounded-md shadow-sm focus:outline-none'
			>
				{ JSON.stringify(getCallConfig().monitor, null, 2) }
			</textarea>
		</Accordion>
	);
};

export default Configuration;
