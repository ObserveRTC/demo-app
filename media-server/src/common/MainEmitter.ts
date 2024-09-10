import { EventEmitter } from "events";

export type MainEmitterEventMap = {
	'sample': [{
		callId: string,
		clientId: string,
		mediaUnitId: string,
		roomId: string,
		sampleInBase64: string,
		serviceId: string,
		userId?: string,
	}],
}

export declare interface MainEmitter {
	// eslint-disable-next-line no-unused-vars
	on<U extends keyof MainEmitterEventMap>(event: U, listener: (...args: MainEmitterEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	off<U extends keyof MainEmitterEventMap>(event: U, listener: (...args: MainEmitterEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	once<U extends keyof MainEmitterEventMap>(event: U, listener: (...args: MainEmitterEventMap[U]) => void): this;
	// eslint-disable-next-line no-unused-vars
	emit<U extends keyof MainEmitterEventMap>(event: U, ...args: MainEmitterEventMap[U]): boolean;
}

/**
 * Some common global event emitter to make things easier in this app
 */
export class MainEmitter extends EventEmitter {
	constructor() {
		super();
	}
};