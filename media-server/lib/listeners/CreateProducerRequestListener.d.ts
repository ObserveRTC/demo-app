import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
import { ClientMessageContext } from "./ClientMessageListener";
export type CreateProducerRequestListenerContext = {
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createCreateProducerRequestListener(listenerContext: CreateProducerRequestListenerContext): (messageContext: ClientMessageContext) => Promise<void>;
//# sourceMappingURL=CreateProducerRequestListener.d.ts.map