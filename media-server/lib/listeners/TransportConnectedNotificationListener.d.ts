import { ClientContext } from "../common/ClientContext";
export type TransportConnectedNotificationListenerContext = {
    clients: Map<string, ClientContext>;
};
export declare function createTransportConnectedNotificationListener(listenerContext: TransportConnectedNotificationListenerContext): (messageContext: any) => Promise<void>;
//# sourceMappingURL=TransportConnectedNotificationListener.d.ts.map