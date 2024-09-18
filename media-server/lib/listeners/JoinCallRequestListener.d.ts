import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
import { ClientMessageContext } from "./ClientMessageListener";
export type JoinCallRequestListenerContext = {
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createJoinCallRequestListener(listenerContext: JoinCallRequestListenerContext): (messageContext: ClientMessageContext) => Promise<void>;
//# sourceMappingURL=JoinCallRequestListener.d.ts.map