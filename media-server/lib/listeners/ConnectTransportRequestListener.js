"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnectTransportRequestListener = createConnectTransportRequestListener;
const logger_1 = require("../common/logger");
const MessageProtocol_1 = require("../protocols/MessageProtocol");
const logger = (0, logger_1.createLogger)('ConnectTransportRequestListener');
function createConnectTransportRequestListener(listenerContext) {
    const { mediasoupService, clients, } = listenerContext;
    const result = async (messageContext) => {
        const { message: request, } = messageContext;
        const client = clients.get(messageContext.clientId);
        if (request.type !== 'connect-transport-request') {
            return console.warn(`Invalid message type ${request.type}`);
        }
        else if (!client) {
            return console.warn(`Client ${messageContext.clientId} not found`);
        }
        let response;
        let error;
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
            response = {};
            logger.info(`Client ${client.clientId} connected transport ${transport.id}`);
        }
        catch (err) {
            response = undefined;
            error = `${err}`;
        }
        messageContext.send(new MessageProtocol_1.Response(request.requestId, response, error));
    };
    return result;
}
