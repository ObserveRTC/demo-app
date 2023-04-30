import * as mediasoup from "mediasoup-client";
import { Samples } from '@observertc/client-monitor-js';

export class ConsumerCreatedNotification {
    public readonly type = 'consumer-created-notification'
    public constructor(
        public readonly consumerId: string,
        public readonly remoteProducerId: string,
        public readonly kind: mediasoup.types.MediaKind,
        public readonly rtpParameters: mediasoup.types.RtpParameters,
        public readonly remoteClient: {
            userId: string,
            clientId: string,
        }
    ) {

    }
}


export class ObservedSamplesNotification {
    public readonly type = 'observed-sample-notification';
    public constructor(
        public readonly clientSample: string
    ) {

    }
}

export class TransportConnectedNotification {
    public readonly type = 'transport-connected-notification';
    public constructor(
        public readonly requestId: string,
        public readonly role: string,
        public readonly dtlsParameters: mediasoup.types.DtlsParameters
    ) {

    }
}

export class ClientRtpCapabilitiesNotification {
    public readonly type = 'client-rtp-capabilities';
    public constructor(
        public readonly rtpCapabilities: mediasoup.types.RtpCapabilities
    ) {

    }
}

export class ConsumerClosedNotification {
    public readonly type = 'consumer-closed-notification';
    public constructor(
        public readonly consumerId: string
    ) {

    }
}

export class JoinCallRequest {
    public readonly type = 'join-call-request';
    public constructor(
        public readonly requestId: string
    ) {

    }
}

export class JoinCallResponse {
    public readonly type = 'join-call-response';
    public constructor(
        public readonly requestId: string,
        public readonly callId: string,
        public readonly observerAccessToken: string,
    ) {

    }
}

export class GetRouterCapabilitiesRequest {
    public readonly type = 'get-router-capabilities-request';
    public constructor(
        public readonly requestId: string
    ) {

    }
}

export class GetRouterCapabilitiesResponse {
    public readonly type = 'get-router-capabilities-response';
    public constructor(
        public readonly requestId: string,
        public readonly rtpCapabilities: mediasoup.types.RtpCapabilities
    ) {

    }
}

export class CreateProducerRequest {
    public readonly type = 'create-producer-request';
    public constructor(
        public readonly requestId: string,
        public readonly kind: mediasoup.types.MediaKind,
        public readonly rtpParameters: any,
        public readonly userId: string
    ) {

    }
}

export class CreateProducerResponse {
    public readonly type = 'create-producer-response';
    public constructor(
        public readonly requestId: string,
        public readonly producerId: string
    ) {

    }
}


export class ResumeProducerRequest {
    public readonly type = 'resume-producer-request';
    public constructor(
        public readonly requestId: string,
        public readonly producerId: string
    ) {

    }
}

export class ResumeProducerResponse {
    public readonly type = 'resume-producer-response';
    public constructor(
        public readonly requestId: string
    ) {

    }
}

export class PauseProducerRequest {
    public readonly type = 'pause-producer-request';
    public constructor(
        public readonly requestId: string,
        public readonly producerId: string
    ) {

    }
}

export class PauseProducerResponse {
    public readonly type = 'pause-producer-response';
    public constructor(
        public readonly requestId: string
    ) {

    }
}

export class CreateTransportRequest {
    public readonly type = 'create-transport-request';
    public constructor(
        public readonly requestId: string,
        public readonly role: 'producing' | 'consuming'
    ) {

    }
}

export class TransportInfo {
    public constructor(
        public readonly id: string,
        public readonly iceParameters: mediasoup.types.IceParameters,
        public readonly iceCandidates: mediasoup.types.IceCandidate[],
        public readonly dtlsParameters: mediasoup.types.DtlsParameters
    ) {

    }
}

export class CreateTransportResponse extends TransportInfo {
    public readonly type = 'create-transport-response';
    public constructor(
        public readonly requestId: string,
        id: string,
        iceParameters: mediasoup.types.IceParameters,
        iceCandidates: mediasoup.types.IceCandidate[],
        dtlsParameters: mediasoup.types.DtlsParameters
    ) {
        super(id, iceParameters, iceCandidates, dtlsParameters);
    }
}

export class GetClientStatsRequest {
    public readonly type = 'get-client-stats-request';
    public constructor(
        public readonly requestId: string,
        public readonly remoteClientId: string,
    ) {

    }
}

export type ClientTrackStats = {
    kind: string,
}

export class GetClientStatsResponse {
    public readonly type = 'get-client-stats-response';
    public constructor(
        public readonly requestId: string,
        public readonly tracks: ClientTrackStats[]
    ) {

    }
}

export type Request = 
    | GetRouterCapabilitiesRequest
    | CreateProducerRequest
    | ResumeProducerRequest
    | PauseProducerRequest
    | GetRouterCapabilitiesRequest
    | CreateTransportRequest
    | GetClientStatsRequest
    | JoinCallRequest
;

export type Response = 
    | CreateProducerResponse
    | ResumeProducerResponse
    | PauseProducerResponse
    | GetRouterCapabilitiesResponse
    | CreateTransportResponse
    | GetClientStatsResponse
    | JoinCallResponse
;

export type Notification = 
    | ObservedSamplesNotification
    | ConsumerClosedNotification
    | ConsumerCreatedNotification
    | TransportConnectedNotification
    | ClientRtpCapabilitiesNotification
;

export type Message = Request | Response | Notification
