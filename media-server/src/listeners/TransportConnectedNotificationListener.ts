import { ClientContext } from "../common/ClientContext";
import { createLogger } from "../common/logger";

const logger = createLogger('TransportConnectedNotificationListener');

export type TransportConnectedNotificationListenerContext = {
	clients: Map<string, ClientContext>;
}

export function createTransportConnectedNotificationListener(listenerContext: TransportConnectedNotificationListenerContext) {
		const { 
			clients,
		} = listenerContext;
		
		const result = async (messageContext: any) => {
			const { 
				message: notification,
			} = messageContext;
			const client = clients.get(messageContext.clientId);

			if (notification.type !== 'transport-connected-notification') {
				return console.warn(`Invalid message type ${notification.type}`);
			} else if (!client) {
				return console.warn(`Client ${messageContext.clientId} not found`);
			}

			const { dtlsParameters, role } = notification;
			const transport = role === 'consuming'
				? client.rcvTransport
				: client.sndTransport;
			if (!transport) {
				logger.warn(`Attempted to connect a non-existing ${role} transport for client ${messageContext.clientId}, userId: ${messageContext.userId}.`);
				return;
			}

			try {
				await transport.connect({ dtlsParameters })
			} catch (err) {
				logger.error(`Error occurred while trying to connect a transport`, err);
				return;
			}

		};
		return result;
}