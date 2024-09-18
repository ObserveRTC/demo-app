import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
import { ClientMessageListener } from "./ClientMessageListener";
export type ControlProducerNotificationListenerContext = {
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createControlProducerNotificationListener(listenerContext: ControlProducerNotificationListenerContext): ClientMessageListener;
//# sourceMappingURL=ControlProducerNotificationListener.d.ts.map