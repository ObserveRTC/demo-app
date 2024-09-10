import { Component, createEffect, createResource, createSignal, onCleanup, Show } from 'solid-js';
import { clientStore } from '../stores/LocalClientStore';
import { Button } from '@suid/material';

const LocalClientVideo: Component<{showControls?: boolean}> = (props) => {
	let mediaRef: HTMLVideoElement;
	const [ videoAction, setVideoAction ] = createSignal<'resume' | 'pause'>('resume');
	const [ audioAction, setAudioAction ] = createSignal<'enable' | 'disable'>('disable');
	createResource(videoAction, async (producerAction) => {
		const call = clientStore.call;
		const producers = [...(call?.mediaProducers.values() ?? [])].filter((producer) => producer.kind === 'video');

		if (!producers || producers.length < 1) return;

		producers.forEach(producer => producer[producerAction]());
	});

	createResource(audioAction, async (producerAction) => {
		const call = clientStore.call;
		const producers = [...(call?.mediaProducers.values() ?? [])].filter((producer) => producer.kind === 'audio');

		if (!producers || producers.length < 1) return;

		producers.forEach(producer => producerAction === 'enable' ? producer.resume() : producer.pause());
	});
	
	createEffect(() => {
		if (!clientStore.mediaStream) return;

		mediaRef.srcObject = clientStore.mediaStream;
	});

	onCleanup(() => {
		mediaRef.srcObject = null;
		mediaRef.onplay = null;
		mediaRef.onpause = null;
	});

	return (
		<>
			<video ref={ mediaRef! } class='w-full aspect-[16/9] rounded-lg overflow-hidden shadow-sm' autoplay playsinline muted />
			<Show when={props.showControls}>
				<Button onClick={ () => setVideoAction(videoAction() === 'pause' ? 'resume' : 'pause') }>
					{ videoAction() === 'pause' ? 'resume' : 'pause' }
				</Button>
				<Button onClick={ () => setAudioAction(audioAction() === 'enable' ? 'disable' : 'enable') }>
					{ (audioAction() === 'enable' ? 'disable' : 'enable').concat(' mic') }
				</Button>
			</Show>
		</>
		
	);
};

export default LocalClientVideo;
