import * as mediasoup from 'mediasoup';

/* eslint-disable no-unused-vars */
type UnionizeEvent<T extends object> = {
	[k in keyof T]: { 
		type: k; 
		payload: T[k]
	};
}[keyof T];

export class ConsumerCreatedNotification {
	public readonly type = 'consumer-created-notification';
	public constructor(
        public readonly consumerId: string,
        public readonly remoteProducerId: string,
        public readonly kind: mediasoup.types.MediaKind,
        public readonly rtpParameters: mediasoup.types.RtpParameters,
        public readonly remoteProducer: {
            producerId: string,
            paused: boolean,
        },
        public readonly remoteClient: {
            userId: string,
            clientId: string,
        }
	) {

	}
}

export class TransportConnectedNotification {
	public readonly type = 'transport-connected-notification';
	public constructor(
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

export class JoinCallRequest {
	public readonly type = 'join-call-request';
	public constructor(
        public readonly requestId: string,
        public readonly callId?: string
	) {

	}
}

export type JoinCallResponsePayload = {
    callId: string,
    readonly rtpCapabilities: mediasoup.types.RtpCapabilities,
    iceServers: {
        urls: string
        credential?: string
        username?: string
    }[],
}

export class CreateProducerRequest {
	public readonly type = 'create-producer-request';
	public constructor(
        public readonly requestId: string,
        public readonly kind: mediasoup.types.MediaKind,
        public readonly rtpParameters: any,
	) {

	}
}

export type CreateProducerResponsePayload = {
    readonly producerId: string
}

export class ControlProducerNotification {
	public readonly type = 'control-producer-notification';
	public constructor(
        public readonly producerId: string,
        public readonly action: 'pause' | 'resume' | 'close'
	) {

	}
}

export class ControlConsumerNotification {
	public readonly type = 'control-consumer-notification';
	public constructor(
        public readonly consumerId: string,
        public readonly action: 'producerPaused' | 'producerResume' | 'pause' | 'resume' | 'close'
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

export type CreateTransportResponsePayload = {
    id: string,
    iceParameters: mediasoup.types.IceParameters,
    iceCandidates: mediasoup.types.IceCandidate[],
    dtlsParameters: mediasoup.types.DtlsParameters
}

export class ConnectTransportRequest {
	public readonly type = 'connect-transport-request';
	public constructor(
        public readonly requestId: string,
        public readonly transportId: string,
        public readonly dtlsParameters: mediasoup.types.DtlsParameters
	) {

	}
}

export type ConnectTransportResponsePayload = {
}

export class ControlTransportNotification {
	public readonly type = 'control-transport-notification';
	public constructor(
        public readonly transportId: string,
        public readonly action: 'close'
	) {

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

export class ClientMonitorSampleNotification {
	public readonly type = 'client-monitor-sample-notification';
	public constructor(
        public readonly sample: string,
	) {

	}
}

export type ObservedScorePayload = {
    score: number,
	timestamp: number,
	remarks: {
        severity: 'none' | 'minor' | 'major' | 'critical',
        text: string,
    }[],
}

export type ObserverGetCallStatsResponse = {
    callScore?: ObservedScorePayload,
    clients: {
        clientId: string,
        clientScore?: ObservedScorePayload,
        peerConnections: {
            peerConnectionId: string,
            peerConnectionScore?: ObservedScorePayload,
            avgRttInMs: number,
            inboundAudioTracks: {
                trackId: string,
                trackScore?: ObservedScorePayload,
                receivingBitrate: number,
                totalLostPackets: number,
            }[],
            inboundVideoTracks: {
                trackId: string,
                trackScore?: ObservedScorePayload,
                receivingBitrate: number,
                totalLostPackets: number,
            }[],
            outboundAudioTracks: {
                trackId: string,
                trackScore?: ObservedScorePayload,
                sendingBitrate: number,
            }[],
            outboundVideoTracks: {
                trackId: string,
                trackScore?: ObservedScorePayload,
                sendingBitrate: number,
            }[],
        }[],
    }[],
}

export type ObservedGetOngoingCallResponse = {
    calls: {
        callId: string,
        clients: {
            clientId: string,
            peerConnections: {
                peerConnectionId: string,
                inboundAudioTrackIds: string[],
                inboundVideoTrackIds: string[],
                outboundAudioTrackIds: string[],
                outboundVideoTrackIds: string[],
            }[],
        }[],
    }[],
}

export type ObserverRequestTypes = {
    'getOngoingCalls': {

    },
    'getCallStats': {
        callId: string,
    },
}
// ;let's put everything observer related here and we will poll in this example
// type ObserverOperation = Union
export class ObserverRequest {
	public readonly type = 'observer-request';
	public constructor(
        public readonly requestId: string,
        public readonly operation: UnionizeEvent<ObserverRequestTypes>,
	) {

	}
}

export type RequestMap = {
    [k in CreateProducerRequest['type']]: {
        request: CreateProducerRequest,
        response: CreateProducerResponsePayload
    }
} & {
    [k in CreateTransportRequest['type']]: {
        request: CreateTransportRequest,
        response: CreateTransportResponsePayload
    }
} & {
    [k in GetClientStatsRequest['type']]: {
        request: GetClientStatsRequest,
        response: unknown
    }
} & {
    [k in JoinCallRequest['type']]: {
        request: JoinCallRequest,
        response: JoinCallResponsePayload
    }
} & {
    [k in ConnectTransportRequest['type']]: {
        request: ConnectTransportRequest,
        response: ConnectTransportResponsePayload
    }
} & {
    [k in ObserverRequest['type']]: {
        request: ObserverRequest,
        response: ObservedGetOngoingCallResponse | 
        ObserverGetCallStatsResponse
    }
}

export type NotificationMap = {
    [k in ControlProducerNotification['type']]: ControlProducerNotification
} & {
    [k in ControlConsumerNotification['type']]: ControlConsumerNotification
} & {
    [k in ConsumerCreatedNotification['type']]: ConsumerCreatedNotification
} & {
    [k in TransportConnectedNotification['type']]: TransportConnectedNotification
} & {
    [k in ClientRtpCapabilitiesNotification['type']]: ClientRtpCapabilitiesNotification
} & {
    [k in ControlTransportNotification['type']]: ControlTransportNotification
} & {
    [k in ClientMonitorSampleNotification['type']]: ClientMonitorSampleNotification
}


export type Request = 
    | CreateProducerRequest
    | CreateTransportRequest
    | GetClientStatsRequest
    | JoinCallRequest
    | ConnectTransportRequest
    | ObserverRequest
;

export class Response {
	public readonly type = 'response';
	public constructor(
        public readonly requestId: string,
        public readonly payload?: unknown,
        public readonly error?: string,
	) {
		// empty
	}
}

export type Notification = 
    | ControlProducerNotification
    | ControlConsumerNotification
    | ConsumerCreatedNotification
    | TransportConnectedNotification
    | ClientRtpCapabilitiesNotification
    | ControlTransportNotification
    | ClientMonitorSampleNotification
;

export type ClientMessage = Request | Response | Notification
