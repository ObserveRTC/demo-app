"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createControlConsumerNotificationListener = createControlConsumerNotificationListener;
const logger_1 = require("../common/logger");
const logger = (0, logger_1.createLogger)('ControlConsumerNotificationListener');
function createControlConsumerNotificationListener(listenerContext) {
    const { mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: request, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (request.type !== 'control-consumer-notification') {
            return console.warn(`Invalid message type ${request.type}`);
        }
        else if (!client?.mediaConsumers.has(request.consumerId)) {
            return console.warn(`Consumer ${request.consumerId} not found for client ${messageContext.clientId}`);
        }
        const consumer = mediasoupService.mediaConsumers.get(request.consumerId);
        if (!consumer) {
            return console.warn(`Consumer ${request.consumerId} not found`);
        }
        logger.debug(`Client ${client.clientId} controlling consumer ${consumer.id}. request: %o`, request);
        try {
            switch (request.action) {
                case 'pause':
                    await consumer.pause();
                    break;
                case 'resume':
                    await consumer.resume();
                    break;
                case 'close':
                    consumer.appData.remoteClosed = true;
                    consumer.close();
                    break;
            }
        }
        catch (err) {
            logger.warn(`Error occurred while trying to control consumer %o`, err);
        }
    };
    return result;
}
