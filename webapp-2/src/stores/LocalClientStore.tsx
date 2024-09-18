import { createStore } from 'solid-js/store';
import { Connection } from '../utils/Connection';

type SavedMediaDevice = {
	deviceId: string;
	kind: string;
	label: string;
};

type UpdateDeviceOptions = {
	newVideoDeviceId?: string;
	newAudioDeviceId?: string;
};


export type LocalClientStore = {
	updateInProgress: boolean;
	call?: Connection;
	userId?: string,
	audioDevices: SavedMediaDevice[];
	videoDevices: SavedMediaDevice[];
	selectedAudioDeviceId?: string;
	selectedVideoDeviceId?: string;
	mediaStream?: MediaStream;
}

export const [clientStore, setClientStore] = createStore<LocalClientStore>({
	updateInProgress: false,
	audioDevices: [],
	videoDevices: [],
});

export async function updateClientMediaDevices(): Promise<void> {
	const devicesList = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.deviceId).map((d) => ({ deviceId: d.deviceId, kind: d.kind, label: d.label }));

	setClientStore({
		...clientStore,
		audioDevices: devicesList.filter((d) => d.kind === 'audioinput'),
		videoDevices: devicesList.filter((d) => d.kind === 'videoinput'),
	});
}

export async function updateClientMedia({ newVideoDeviceId, newAudioDeviceId }: UpdateDeviceOptions = {}): Promise<void> {
	if (!clientStore.audioDevices.length && !clientStore.videoDevices.length) {
		await updateClientMediaDevices();
	}

	let audioDeviceId = newAudioDeviceId ? getDeviceId(newAudioDeviceId, 'audioinput') : clientStore.selectedAudioDeviceId;
	let videoDeviceId = newVideoDeviceId ? getDeviceId(newVideoDeviceId, 'videoinput') : clientStore.selectedVideoDeviceId;

	setClientStore({ 
		...clientStore, 
		updateInProgress: true 
	});
	try {
		clientStore.mediaStream?.getTracks().forEach((track) => track.stop());
		
		const mediaStream = await navigator.mediaDevices.getUserMedia({
			audio: { deviceId: { ideal: audioDeviceId } },
			video: { deviceId: { ideal: videoDeviceId }, width: { ideal: 1280 } },
		});
		
		const [ videoTrack ] = mediaStream.getVideoTracks();
		const [ audioTrack ] = mediaStream.getAudioTracks();

		const selectedVideoDeviceId = videoTrack.getSettings().deviceId;
		const selectedAudioDeviceId = audioTrack.getSettings().deviceId;
		
		await updateClientMediaDevices();

		setClientStore({
			...clientStore,
			updateInProgress: false,
			mediaStream,
			selectedAudioDeviceId,
			selectedVideoDeviceId,
		});
	} catch(err) {
		console.error(err);
		setClientStore({ 
			...clientStore, 
			updateInProgress: false 
		});
	}
}

export const getDeviceId = (deviceId: string | undefined, kind: 'videoinput' | 'audioinput'): string | undefined => {
	const devices = kind === 'videoinput' ? clientStore.videoDevices : clientStore.audioDevices;

	return (devices.find((d) => d.deviceId === deviceId) ?? devices.find((d) => d.kind === kind))?.deviceId;
};
