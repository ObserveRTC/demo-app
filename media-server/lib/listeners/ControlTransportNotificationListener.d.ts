import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
import { ClientMessageContext } from "./ClientMessageListener";
export type CreateControlTransportNotificationListenerContext = {
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createControlTransportNotificationListener(listenerContext: CreateControlTransportNotificationListenerContext): (messageContext: ClientMessageContext) => Promise<void>;
//# sourceMappingURL=ControlTransportNotificationListener.d.ts.map