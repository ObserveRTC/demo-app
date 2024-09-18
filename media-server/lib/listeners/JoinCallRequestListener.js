"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJoinCallRequestListener = createJoinCallRequestListener;
const logger_1 = require("../common/logger");
const MessageProtocol_1 = require("../protocols/MessageProtocol");
const logger = (0, logger_1.createLogger)('JoinCallRequestListener');
function createJoinCallRequestListener(listenerContext) {
    const { mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: request, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (request.type !== 'join-call-request') {
            return console.warn(`Invalid message type ${request.type}`);
        }
        else if (!client) {
            return console.warn(`Client ${messageContext.clientId} not found`);
        }
        logger.debug(`Client ${client.clientId} joining call ${request.callId}. request: %o`, request);
        let response;
        let error;
        try {
            const router = await mediasoupService.getOrCreateRouter(request.callId);
            client.routerId = router.id;
            response = {
                callId: router.id,
                rtpCapabilities: router.rtpCapabilities,
                iceServers: [],
            };
            logger.info(`Client ${client.clientId} joined call ${router.id}`);
        }
        catch (err) {
            response = undefined;
            error = `${err}`;
        }
        messageContext.send(new MessageProtocol_1.Response(request.requestId, response, error));
    };
    return result;
}
