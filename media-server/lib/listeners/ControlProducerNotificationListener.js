"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createControlProducerNotificationListener = createControlProducerNotificationListener;
const logger_1 = require("../common/logger");
const logger = (0, logger_1.createLogger)('ControlProducerNotificationListener');
function createControlProducerNotificationListener(listenerContext) {
    const { mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: request, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (request.type !== 'control-producer-notification') {
            return console.warn(`Invalid message type ${request.type}`);
        }
        else if (!client?.mediaProducers.has(request.producerId)) {
            return console.warn(`Producer ${request.producerId} not found for client ${messageContext.clientId}`);
        }
        const producer = mediasoupService.mediaProducers.get(request.producerId);
        if (!producer) {
            return console.warn(`Producer ${request.producerId} not found`);
        }
        try {
            switch (request.action) {
                case 'pause':
                    await producer.pause();
                    break;
                case 'resume':
                    await producer.resume();
                    break;
                case 'close':
                    producer.appData.remoteClosed = true;
                    producer.close();
                    break;
            }
        }
        catch (err) {
            logger.warn(`Error occurred while trying to control producer %o`, err);
        }
    };
    return result;
}
