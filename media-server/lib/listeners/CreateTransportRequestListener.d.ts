import { Server } from "../Server";
import { ClientContext } from "../common/ClientContext";
import { MediasoupService } from "../services/MediasoupService";
export type CreateTransportRequestListenerContext = {
    server: Server;
    mediasoupService: MediasoupService;
    clients: Map<string, ClientContext>;
};
export declare function createCreateTransportRequestListener(listenerContext: CreateTransportRequestListenerContext): (messageContext: any) => Promise<void>;
//# sourceMappingURL=CreateTransportRequestListener.d.ts.map