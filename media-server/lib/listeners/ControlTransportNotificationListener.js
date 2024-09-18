"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createControlTransportNotificationListener = createControlTransportNotificationListener;
const logger_1 = require("../common/logger");
const logger = (0, logger_1.createLogger)('CreateProducerNotificationListener');
function createControlTransportNotificationListener(listenerContext) {
    const { mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: notification, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (notification.type !== 'control-transport-notification') {
            return console.warn(`Invalid message type ${notification.type}`);
        }
        else if (!client) {
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
        }
        catch (err) {
            logger.warn(`Error occurred while trying to control transport %o`, err);
        }
    };
    return result;
}
