"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreateProducerRequestListener = createCreateProducerRequestListener;
const logger_1 = require("../common/logger");
const MessageProtocol_1 = require("../protocols/MessageProtocol");
const logger = (0, logger_1.createLogger)('CreateProducerRequestListener');
function createCreateProducerRequestListener(listenerContext) {
    const { mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: request, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (request.type !== 'create-producer-request') {
            return console.warn(`Invalid message type ${request.type}`);
        }
        else if (!client) {
            return console.warn(`Client ${messageContext.clientId} not found`);
        }
        else if (client.sndTransport === undefined) {
            return console.warn(`Client ${messageContext.clientId} has no sending transport`);
        }
        let response;
        let error;
        try {
            const producer = await client.sndTransport.produce({
                kind: request.kind,
                rtpParameters: request.rtpParameters,
            });
            producer.observer.once('close', () => {
                client.mediaProducers.delete(producer.id);
            });
            client.mediaProducers.add(producer.id);
            response = {
                producerId: producer.id,
            };
            for (const consumingClient of clients.values()) {
                if (client.clientId === consumingClient.clientId)
                    continue;
                if (client.routerId !== consumingClient.routerId)
                    continue;
                if (!consumingClient)
                    continue;
                try {
                    const consumer = await mediasoupService.consumeMediaProducer(producer.id, consumingClient);
                    consumingClient.send(new MessageProtocol_1.ConsumerCreatedNotification(consumer.id, producer.id, consumer.kind, consumer.rtpParameters, {
                        producerId: producer.id,
                        paused: producer.paused,
                    }, {
                        clientId: client.clientId,
                        userId: client.userId,
                    }));
                }
                catch (err) {
                    logger.error(`Error occurred while trying to consume media producer ${producer.id}`, err);
                }
            }
        }
        catch (err) {
            error = `${err}`;
        }
        messageContext.send(new MessageProtocol_1.Response(request.requestId, response, error));
    };
    return result;
}
