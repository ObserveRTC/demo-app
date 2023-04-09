import { ClientMonitor } from "@observertc/client-monitor-js";

export type MediaServiceEvents = {
	addedMediaConsumer: {
		track: MediaStreamTrack,
		remoteClientId: string,
		userId?: string,
	},
	removedMediaConsumer: {
		trackId: string,
	},
	close: undefined,
}

export interface MediaService {
	readonly monitor: ClientMonitor;
	connect(): Promise<void>
	produceMedia(track: MediaStreamTrack): Promise<void>;
	pauseMedia(track: MediaStreamTrack): void;
	resumeMedia(track: MediaStreamTrack): void;

	on<K extends keyof MediaServiceEvents>(event: K, listener: (data: MediaServiceEvents[K]) => void): this;
	once<K extends keyof MediaServiceEvents>(event: K, listener: (data: MediaServiceEvents[K]) => void): this;
	off<K extends keyof MediaServiceEvents>(event: K, listener: (data: MediaServiceEvents[K]) => void): this;
}
