import { EventEmitter } from "events";
export type MainEmitterEventMap = {
    'sample': [
        {
            callId: string;
            clientId: string;
            mediaUnitId: string;
            roomId: string;
            sampleInBase64: string;
            serviceId: string;
            userId?: string;
        }
    ];
};
export declare interface MainEmitter {
    on<U extends keyof MainEmitterEventMap>(event: U, listener: (...args: MainEmitterEventMap[U]) => void): this;
    off<U extends keyof MainEmitterEventMap>(event: U, listener: (...args: MainEmitterEventMap[U]) => void): this;
    once<U extends keyof MainEmitterEventMap>(event: U, listener: (...args: MainEmitterEventMap[U]) => void): this;
    emit<U extends keyof MainEmitterEventMap>(event: U, ...args: MainEmitterEventMap[U]): boolean;
}
/**
 * Some common global event emitter to make things easier in this app
 */
export declare class MainEmitter extends EventEmitter {
    constructor();
}
//# sourceMappingURL=MainEmitter.d.ts.map