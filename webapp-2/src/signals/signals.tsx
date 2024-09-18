import { createSignal } from 'solid-js';

export type Page = 
    | 'lobby' 
    | 'stunner'
    | 'videoCall' 
    | 'clientMonitor'
    | 'exit' 
    | 'observer';

export const [ page, setPage ] = createSignal<Page>('lobby');

export type MediaResults = 'tcp' | 'relay' | 'bw' | 'loss' | 'latency' | 'connection';

type MediaDevice = { deviceId: string; kind: MediaDeviceKind; label: string; }

export const [ participantId, setParticipantId ] = createSignal<string>();
export const [ slugId, setSlugId ] = createSignal<string>();

export const [ availableOutgoingBitrates, setAvailableOutgoingBitrates ] = createSignal<number[]>([]);

export const [ incomingBitrate, setIncomingBitrate ] = createSignal<number[]>([]);
export const [ outgoingBitrate, setOutgoingBitrate ] = createSignal<number[]>([]);

export const [ packetLoss, setPacketLoss ] = createSignal<number[]>([]);
export const [ rtt, setRtt ] = createSignal<number[]>([]);

export const [ webcamTrack, setWebcamTrack ] = createSignal<MediaStreamTrack>();
export const [ micTrack, setMicTrack ] = createSignal<MediaStreamTrack>();

export const [ videoDevices, setVideoDevices ] = createSignal<MediaDevice[]>([]);
export const [ audioDevices, setAudioDevices ] = createSignal<MediaDevice[]>([]);

export const [ videoDeviceId, setVideoDeviceId ] = createSignal<string>();
export const [ audioDeviceId, setAudioDeviceId ] = createSignal<string>();

export const [ lowBandwidth, setLowBandwidth ] = createSignal<boolean>(false);
export const [ highLatency, setHighLatency ] = createSignal<boolean>(false);
export const [ highPacketLoss, setHighPacketLoss ] = createSignal<boolean>(false);
export const [ usingRelay, setUsingRelay ] = createSignal<boolean>(false);
export const [ usingTCP, setUsingTCP ] = createSignal<boolean>(false);
