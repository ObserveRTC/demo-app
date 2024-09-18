import { Observer } from "@observertc/observer-js";
import { ClientContext } from "../common/ClientContext";
import { ClientMessageContext } from "./ClientMessageListener";
export type ClientMonitorSampleNotificatinListenerContext = {
    observer: Observer;
    clients: Map<string, ClientContext>;
};
export declare function createObserverRequestListener(listenerContext: ClientMonitorSampleNotificatinListenerContext): (messageContext: ClientMessageContext) => Promise<void>;
//# sourceMappingURL=ObserverRequestListener.d.ts.map