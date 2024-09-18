import { Observer } from "@observertc/observer-js";
import { ClientContext } from "../common/ClientContext";
import { ClientMessageContext } from "./ClientMessageListener";
import { MainEmitter } from "../common/MainEmitter";
export type ClientMonitorSampleNotificatinListenerContext = {
    clients: Map<string, ClientContext>;
    observer: Observer;
    mainEmitter: MainEmitter;
};
export declare function createClientMonitorSampleNotificatinListener(listenerContext: ClientMonitorSampleNotificatinListenerContext): (messageContext: ClientMessageContext) => Promise<void>;
//# sourceMappingURL=ClientMonitorSampleNotificationListener.d.ts.map