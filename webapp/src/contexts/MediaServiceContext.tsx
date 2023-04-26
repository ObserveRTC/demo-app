import { createClientMonitor } from '@observertc/client-monitor-js';
import { Device } from 'mediasoup-client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createLogger } from '../utils/logger';
import { MediaService } from './MediaService';
import { ServerConnection } from './ServerConnection';
import { MediasoupService } from './MediasoupService';
import { ObservedSamplesNotification } from '../utils/MessageProtocol';
import { useAppSelector } from '../store/hooks';
import { ClientSampleEncoder } from "@observertc/samples-encoder";

const logger = createLogger('MediaServiceContext');

const MediaServiceContext = createContext<MediaService | null>(null);

export const useMediaServiceContext = (): MediaService | null => {
  return useContext(MediaServiceContext);
};

interface MediaServiceContextProps {
  children: ReactNode;
  roomId: string;
  serviceType: 'mediasoup'
}
let called = 0;

export const MediaServiceProvider: React.FC<MediaServiceContextProps> = ({ children, roomId, serviceType }) => {
	const localClient = useAppSelector(state => state.localClient);
	const [mediaService, setMediaService] = useState<MediaService | null>(null);
	const [serverConnection] = useState<ServerConnection>(new ServerConnection({
			maxBufferSize: -1, // inf
			maxBufferTimeInMs: -1, // inf
			maxRetry: -1, // inf
			retryingPaceTimeInMs: 1000,
			resendPaceInMs: 200,
			url: `ws://localhost:8080?${
			[
				`roomId=${roomId}`,
				`clientId=${localClient.clientId}`,
				`userId=${localClient.userId}`
			]
			.join('&')}
			`,

  }));

  useEffect(() => {
	if (1 < ++called) return;

	const monitor = createClientMonitor({
		collectingPeriodInMs: 2000,
		samplingPeriodInMs: 5000,
		sendingPeriodInMs: 10000,
	});

	if (serviceType === 'mediasoup') {
		const device = new Device();
		
		monitor.collectors.addMediasoupDevice(device);


		const mediaService = new MediasoupService(
			serverConnection,
			device,
			monitor,
		);
		mediaService.connect().then(() => {
			setMediaService(mediaService);
		});
		
	}
	
	for (const peerConnection of Array.from(monitor.storage.peerConnections())) {
		if (peerConnection.label === 'snd') {
			
		}
	}
	
	// const ws = new WebSocket(`ws://localhost:7080/`);
	const clientSampleEncoder = new ClientSampleEncoder();
	// const messageSizes: number[] = [];
	
	monitor.on('sample-created', ({ clientSample }) => {
		
		try {
			// const messageSize = clientSampleEncoder.encodeToUint8Array(clientSample).length;
			// messageSizes.push(messageSize);
			// console.log("message sizes", messageSizes);
			const encodedSample = clientSampleEncoder.encodeToBase64(clientSample);
			// ws.send(encodedSample.toBinary());
			serverConnection.sendMessage(new ObservedSamplesNotification(
				encodedSample,
			))
		} catch (err ) {
			console.error(err);
		}
		
		
		
	})
  }, [])

  return (<MediaServiceContext.Provider value={mediaService}>{children}</MediaServiceContext.Provider>);
};
