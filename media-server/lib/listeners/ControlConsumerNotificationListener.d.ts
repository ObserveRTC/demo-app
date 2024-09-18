import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
import { ClientMessageListener } from "./ClientMessageListener";
export type ControlConsumerNotificationListenerContext = {
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createControlConsumerNotificationListener(listenerContext: ControlConsumerNotificationListenerContext): ClientMessageListener;
//# sourceMappingURL=ControlConsumerNotificationListener.d.ts.map