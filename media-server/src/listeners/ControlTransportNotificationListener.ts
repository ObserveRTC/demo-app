import { ClientContext } from "../common/ClientContext";
import { createLogger } from "../common/logger";
import { MediasoupService } from "../services/MediasoupService"
import { ClientMessageContext } from "./ClientMessageListener";

const logger = createLogger('CreateProducerNotificationListener');

export type CreateControlTransportNotificationListenerContext = {
	mediasoupService: MediasoupService,
	clients: Map<string, ClientContext>,
}

export function createControlTransportNotificationListener(listenerContext: CreateControlTransportNotificationListenerContext) {
	const { 
		mediasoupService,
		clients,
	} = listenerContext;
	const result = async (messageContext: ClientMessageContext) => {
		const { 
			message: notification,
		} = messageContext;
		const client = clients.get(messageContext.clientId);
		if (notification.type !== 'control-transport-notification') {
			return console.warn(`Invalid message type ${notification.type}`);
		} else if (!client) {
			return console.warn(`Client ${messageContext.clientId} not found`);
		}

		try {
			const transport = notification.transportId === client.sndTransport?.id
				? client.sndTransport
				: notification.transportId === client.rcvTransport?.id
				? client.rcvTransport
				: undefined;

			if (!transport) {
				return logger.warn(`Transport ${notification.transportId} not found for client ${client.clientId}`);
			}

			switch (notification.action) {
				case 'close': {
					transport.close();
					break;
				}
			}
		} catch (err) {
			logger.warn(`Error occurred while trying to control transport %o`, err);
		}
	};
	return result;
}