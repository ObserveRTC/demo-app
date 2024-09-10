import { ClientContext } from "../common/ClientContext";
import { createLogger } from "../common/logger";
import { JoinCallResponsePayload, Response } from "../protocols/MessageProtocol";
import { MediasoupService } from "../services/MediasoupService"
import { ClientMessageContext } from "./ClientMessageListener";

const logger = createLogger('JoinCallRequestListener');

export type JoinCallRequestListenerContext = {
		mediasoupService: MediasoupService;
		clients: Map<string, ClientContext>;
}

export function createJoinCallRequestListener(listenerContext: JoinCallRequestListenerContext) {
		const { 
			mediasoupService,
			clients,
		} = listenerContext;
		
		const result = async (messageContext: ClientMessageContext) => {
				const { 
					message: request,
				} = messageContext;
				const client = clients.get(messageContext.clientId);
				if (request.type !== 'join-call-request') {
					return console.warn(`Invalid message type ${request.type}`);
				} else if (!client) {
					return console.warn(`Client ${messageContext.clientId} not found`);
				}

				logger.debug(`Client ${client.clientId} joining call ${request.callId}. request: %o`, request);

				let response: JoinCallResponsePayload | undefined;
				let error: string | undefined;
				
				try {
					const router = await mediasoupService.getOrCreateRouter(request.callId);
					
					client.routerId = router.id;

					response = {
						callId: router.id,
						rtpCapabilities: router.rtpCapabilities,
						iceServers: [],
					};
					
					logger.info(`Client ${client.clientId} joined call ${router.id}`);

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