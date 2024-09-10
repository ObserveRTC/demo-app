import { Component, createEffect, onCleanup } from 'solid-js';
import { clientStore } from '../stores/LocalClientStore';

const logger = console;

const RemoteClientAudio: Component<{ consumerId: string }> = (props) => {
	let mediaRef: HTMLVideoElement;
	createEffect(() => {
		const call = clientStore.call;
		const consumer = call?.mediaConsumers.get(props.consumerId);

		if (!consumer) return logger.warn(`Consumer ${props.consumerId} not found`);
		
		mediaRef.srcObject = new MediaStream([ consumer.track ]);
	});

	onCleanup(() => {
		mediaRef.srcObject = null;
		mediaRef.onplay = null;
		mediaRef.onpause = null;
	});

	return (
		<audio ref={ mediaRef! } autoplay />
		
	);
};

export default RemoteClientAudio;
