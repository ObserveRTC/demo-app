"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.ObserverRequest = exports.ClientMonitorSampleNotification = exports.GetClientStatsRequest = exports.ControlTransportNotification = exports.ConnectTransportRequest = exports.CreateTransportRequest = exports.ControlConsumerNotification = exports.ControlProducerNotification = exports.CreateProducerRequest = exports.JoinCallRequest = exports.ClientRtpCapabilitiesNotification = exports.TransportConnectedNotification = exports.ConsumerCreatedNotification = void 0;
class ConsumerCreatedNotification {
    consumerId;
    remoteProducerId;
    kind;
    rtpParameters;
    remoteProducer;
    remoteClient;
    type = 'consumer-created-notification';
    constructor(consumerId, remoteProducerId, kind, rtpParameters, remoteProducer, remoteClient) {
        this.consumerId = consumerId;
        this.remoteProducerId = remoteProducerId;
        this.kind = kind;
        this.rtpParameters = rtpParameters;
        this.remoteProducer = remoteProducer;
        this.remoteClient = remoteClient;
    }
}
exports.ConsumerCreatedNotification = ConsumerCreatedNotification;
class TransportConnectedNotification {
    role;
    dtlsParameters;
    type = 'transport-connected-notification';
    constructor(role, dtlsParameters) {
        this.role = role;
        this.dtlsParameters = dtlsParameters;
    }
}
exports.TransportConnectedNotification = TransportConnectedNotification;
class ClientRtpCapabilitiesNotification {
    rtpCapabilities;
    type = 'client-rtp-capabilities';
    constructor(rtpCapabilities) {
        this.rtpCapabilities = rtpCapabilities;
    }
}
exports.ClientRtpCapabilitiesNotification = ClientRtpCapabilitiesNotification;
class JoinCallRequest {
    requestId;
    callId;
    type = 'join-call-request';
    constructor(requestId, callId) {
        this.requestId = requestId;
        this.callId = callId;
    }
}
exports.JoinCallRequest = JoinCallRequest;
class CreateProducerRequest {
    requestId;
    kind;
    rtpParameters;
    type = 'create-producer-request';
    constructor(requestId, kind, rtpParameters) {
        this.requestId = requestId;
        this.kind = kind;
        this.rtpParameters = rtpParameters;
    }
}
exports.CreateProducerRequest = CreateProducerRequest;
class ControlProducerNotification {
    producerId;
    action;
    type = 'control-producer-notification';
    constructor(producerId, action) {
        this.producerId = producerId;
        this.action = action;
    }
}
exports.ControlProducerNotification = ControlProducerNotification;
class ControlConsumerNotification {
    consumerId;
    action;
    type = 'control-consumer-notification';
    constructor(consumerId, action) {
        this.consumerId = consumerId;
        this.action = action;
    }
}
exports.ControlConsumerNotification = ControlConsumerNotification;
class CreateTransportRequest {
    requestId;
    role;
    type = 'create-transport-request';
    constructor(requestId, role) {
        this.requestId = requestId;
        this.role = role;
    }
}
exports.CreateTransportRequest = CreateTransportRequest;
class ConnectTransportRequest {
    requestId;
    transportId;
    dtlsParameters;
    type = 'connect-transport-request';
    constructor(requestId, transportId, dtlsParameters) {
        this.requestId = requestId;
        this.transportId = transportId;
        this.dtlsParameters = dtlsParameters;
    }
}
exports.ConnectTransportRequest = ConnectTransportRequest;
class ControlTransportNotification {
    transportId;
    action;
    type = 'control-transport-notification';
    constructor(transportId, action) {
        this.transportId = transportId;
        this.action = action;
    }
}
exports.ControlTransportNotification = ControlTransportNotification;
class GetClientStatsRequest {
    requestId;
    remoteClientId;
    type = 'get-client-stats-request';
    constructor(requestId, remoteClientId) {
        this.requestId = requestId;
        this.remoteClientId = remoteClientId;
    }
}
exports.GetClientStatsRequest = GetClientStatsRequest;
class ClientMonitorSampleNotification {
    sample;
    type = 'client-monitor-sample-notification';
    constructor(sample) {
        this.sample = sample;
    }
}
exports.ClientMonitorSampleNotification = ClientMonitorSampleNotification;
// ;let's put everything observer related here and we will poll in this example
// type ObserverOperation = Union
class ObserverRequest {
    requestId;
    operation;
    type = 'observer-request';
    constructor(requestId, operation) {
        this.requestId = requestId;
        this.operation = operation;
    }
}
exports.ObserverRequest = ObserverRequest;
class Response {
    requestId;
    payload;
    error;
    type = 'response';
    constructor(requestId, payload, error) {
        this.requestId = requestId;
        this.payload = payload;
        this.error = error;
        // empty
    }
}
exports.Response = Response;
