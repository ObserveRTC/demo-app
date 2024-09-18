"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreateTransportRequestListener = createCreateTransportRequestListener;
const logger_1 = require("../common/logger");
const MessageProtocol_1 = require("../protocols/MessageProtocol");
const logger = (0, logger_1.createLogger)('CreateTransportRequestListener');
function createCreateTransportRequestListener(listenerContext) {
    const { server, mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: request, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (request.type !== 'create-transport-request') {
            return console.warn(`Invalid message type ${request.type}`);
        }
        else if (!client) {
            return console.warn(`Client ${messageContext.clientId} not found`);
        }
        const { role, requestId } = request;
        const router = mediasoupService.routers.get(client.routerId ?? '');
        let response;
        let error;
        try {
            if (!router) {
                throw new Error(`Client ${client.clientId} has not joined a call yet`);
            }
            if ((role === 'producing' && client.sndTransport) ||
                (role === 'consuming' && client.rcvTransport)) {
                logger.warn(`Attempted to create ${role} transport for client ${client.clientId}, userId: ${client.userId} twice`);
                return;
            }
            const transportOptions = {
                listenIps: [{
                        ip: server.config.serverIp,
                        announcedIp: server.config.announcedIp,
                    }],
            };
            const transport = await router.createWebRtcTransport(transportOptions);
            transport.observer.once('close', () => {
                if (role === 'producing')
                    client.sndTransport = undefined;
                else if (role === 'consuming')
                    client.rcvTransport = undefined;
            });
            if (role === 'producing')
                client.sndTransport = transport;
            else if (role === 'consuming')
                client.rcvTransport = transport;
            response = {
                dtlsParameters: transport.dtlsParameters,
                iceCandidates: transport.iceCandidates,
                iceParameters: transport.iceParameters,
                id: transport.id,
            };
        }
        catch (err) {
            response = undefined;
            error = `${err}`;
        }
        messageContext.send(new MessageProtocol_1.Response(requestId, response, error));
        if (response && role === 'consuming') {
            for (const producingClient of clients.values()) {
                if (client.clientId === producingClient.clientId)
                    continue;
                if (client.routerId !== producingClient.routerId)
                    continue;
                if (!producingClient)
                    continue;
                for (const mediaProducerId of producingClient.mediaProducers) {
                    const mediaProducer = mediasoupService.mediaProducers.get(mediaProducerId);
                    if (!mediaProducer) {
                        logger.warn(`Media producer ${mediaProducerId} not found in mediasoupService, though the client ${producingClient.clientId} has it`);
                        continue;
                    }
                    try {
                        const consumer = await mediasoupService.consumeMediaProducer(mediaProducerId, client);
                        client.send(new MessageProtocol_1.ConsumerCreatedNotification(consumer.id, mediaProducerId, consumer.kind, consumer.rtpParameters, {
                            producerId: mediaProducer.id,
                            paused: mediaProducer.paused,
                        }, {
                            clientId: client.clientId,
                            userId: client.userId,
                        }));
                    }
                    catch (err) {
                        logger.error(`Error occurred while trying to consume media producer ${mediaProducerId}`, err);
                    }
                }
            }
        }
    };
    return result;
}
