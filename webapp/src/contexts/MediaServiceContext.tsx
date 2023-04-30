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
import { ObserverServiceClient } from '../utils/ObserverServiceClient';

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
	const queryString = Object.entries({
		clientId: localClient.clientId,
		userId: localClient.userId,
		roomId,
	}).reduce(
		(str, [key, val]) => `${str}&${key}=${val}`,
		''
	);
	
	const [serverConnection] = useState<ServerConnection>(new ServerConnection({
			maxBufferSize: -1, // inf
			maxBufferTimeInMs: -1, // inf
			maxRetry: -1, // inf
			retryingPaceTimeInMs: 1000,
			resendPaceInMs: 200,
			roomId,
			clientId: localClient.clientId,
			url: `ws://localhost:8080?${queryString}`,

  }));
  
  useEffect(() => {
	if (1 < ++called) return;

	const monitor = createClientMonitor({
		collectingPeriodInMs: 2000,
		samplingPeriodInMs: 7000,
		createCallEvents: true,
	});

	const observerService = new ObserverServiceClient({
		wsAddress: 'wss://',
		reconnect: true,
	});
	monitor.on('sample-created', ({ clientSample }) => {
		observerService.send(clientSample);
	});

	switch (serviceType) {
		case 'mediasoup': {
			const mediaService = new MediasoupService(
				serverConnection,
				monitor,
				observerService,
			);
			mediaService.connect().then(() => {
				setMediaService(mediaService);
			});
			break;
		}
		default:
			console.error(`Unrecognized media service type`, serviceType);
	}
	for (const peerConnection of Array.from(monitor.storage.peerConnections())) {
		if (peerConnection.label === 'snd') {
			
		}
	}
  }, [])

  return (<MediaServiceContext.Provider value={mediaService}>{children}</MediaServiceContext.Provider>);
};
