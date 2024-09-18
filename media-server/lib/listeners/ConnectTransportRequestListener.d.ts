import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
import { ClientMessageContext } from "./ClientMessageListener";
export type ConnectTransportRequestListenerContext = {
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createConnectTransportRequestListener(listenerContext: ConnectTransportRequestListenerContext): (messageContext: ClientMessageContext) => Promise<void>;
//# sourceMappingURL=ConnectTransportRequestListener.d.ts.map