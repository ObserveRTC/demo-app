import { createStore } from 'solid-js/store';

export type RemoteClientsStore = {
	updateInProgress: boolean,
	videoConsumerIds: string[],
	audioConsumerIds: string[],
}

export const [remoteClientStore, setRemoteClientStore] = createStore<RemoteClientsStore>({
	updateInProgress: false,
	videoConsumerIds: [],
	audioConsumerIds: [],
});

export function addVideoConsumerId(videoConsumerId: string) {
	setRemoteClientStore('videoConsumerIds', (ids) => [...ids, videoConsumerId]);
}

export function removeVideoConsumerId(videoConsumerId: string) {
	setRemoteClientStore('videoConsumerIds', (ids) => ids.filter((id) => id !== videoConsumerId));
}

export function addAudioConsumerId(audioConsumerId: string) {
	setRemoteClientStore('audioConsumerIds', (ids) => [...ids, audioConsumerId]);
}

export function removeAudioConsumerId(audioConsumerId: string) {
	setRemoteClientStore('audioConsumerIds', (ids) => ids.filter((id) => id !== audioConsumerId));
}