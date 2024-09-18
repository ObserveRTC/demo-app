import { ClientContext } from "../common/ClientContext";
import { createLogger } from "../common/logger";
import { ConnectTransportResponsePayload, Response } from "../protocols/MessageProtocol";
import { MediasoupService } from "../services/MediasoupService"
import { ClientMessageContext } from "./ClientMessageListener";

const logger = createLogger('ConnectTransportRequestListener');

export type ConnectTransportRequestListenerContext = {
		mediasoupService: MediasoupService;
		clients: Map<string, ClientContext>;
}

export function createConnectTransportRequestListener(listenerContext: ConnectTransportRequestListenerContext) {
		const { 
			mediasoupService,
			clients,
		} = listenerContext;
		
		const result = async (messageContext: ClientMessageContext) => {
				const { 
					message: request,
				} = messageContext;
				const client = clients.get(messageContext.clientId);
				
				if (request.type !== 'connect-transport-request') {
					return console.warn(`Invalid message type ${request.type}`);
				} else if (!client) {
					return console.warn(`Client ${messageContext.clientId} not found`);
				}

				logger.debug(`Transport ${request.transportId} attempt to connect`);

				let response: ConnectTransportResponsePayload | undefined;
				let error: string | undefined;
				
				try {
					const transport = request.transportId === client.sndTransport?.id 
						? client.sndTransport 
						: request.transportId === client.rcvTransport?.id
						? client.rcvTransport
						: undefined;
					
					if (!transport) {
						throw new Error(`Transport ${request.transportId} not found`);
					}

					await transport.connect({
						dtlsParameters: request.dtlsParameters,
					});

					response = {

					};
					
					logger.info(`Client ${client.clientId} connected transport ${transport.id}`);

				} catch (err) {
					response = undefined;
					error = `${err}`;
				}

				messageContext.send(new Response(
					request.requestId,
					response,
					error
				));
		};
		return result;
}