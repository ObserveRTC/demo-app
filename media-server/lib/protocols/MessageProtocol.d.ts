import * as mediasoup from 'mediasoup';
type UnionizeEvent<T extends object> = {
    [k in keyof T]: {
        type: k;
        payload: T[k];
    };
}[keyof T];
export declare class ConsumerCreatedNotification {
    readonly consumerId: string;
    readonly remoteProducerId: string;
    readonly kind: mediasoup.types.MediaKind;
    readonly rtpParameters: mediasoup.types.RtpParameters;
    readonly remoteProducer: {
        producerId: string;
        paused: boolean;
    };
    readonly remoteClient: {
        userId: string;
        clientId: string;
    };
    readonly type = "consumer-created-notification";
    constructor(consumerId: string, remoteProducerId: string, kind: mediasoup.types.MediaKind, rtpParameters: mediasoup.types.RtpParameters, remoteProducer: {
        producerId: string;
        paused: boolean;
    }, remoteClient: {
        userId: string;
        clientId: string;
    });
}
export declare class TransportConnectedNotification {
    readonly role: string;
    readonly dtlsParameters: mediasoup.types.DtlsParameters;
    readonly type = "transport-connected-notification";
    constructor(role: string, dtlsParameters: mediasoup.types.DtlsParameters);
}
export declare class ClientRtpCapabilitiesNotification {
    readonly rtpCapabilities: mediasoup.types.RtpCapabilities;
    readonly type = "client-rtp-capabilities";
    constructor(rtpCapabilities: mediasoup.types.RtpCapabilities);
}
export declare class JoinCallRequest {
    readonly requestId: string;
    readonly callId?: string | undefined;
    readonly type = "join-call-request";
    constructor(requestId: string, callId?: string | undefined);
}
export type JoinCallResponsePayload = {
    callId: string;
    readonly rtpCapabilities: mediasoup.types.RtpCapabilities;
    iceServers: {
        urls: string;
        credential?: string;
        username?: string;
    }[];
};
export declare class CreateProducerRequest {
    readonly requestId: string;
    readonly kind: mediasoup.types.MediaKind;
    readonly rtpParameters: any;
    readonly type = "create-producer-request";
    constructor(requestId: string, kind: mediasoup.types.MediaKind, rtpParameters: any);
}
export type CreateProducerResponsePayload = {
    readonly producerId: string;
};
export declare class ControlProducerNotification {
    readonly producerId: string;
    readonly action: 'pause' | 'resume' | 'close';
    readonly type = "control-producer-notification";
    constructor(producerId: string, action: 'pause' | 'resume' | 'close');
}
export declare class ControlConsumerNotification {
    readonly consumerId: string;
    readonly action: 'producerPaused' | 'producerResume' | 'pause' | 'resume' | 'close';
    readonly type = "control-consumer-notification";
    constructor(consumerId: string, action: 'producerPaused' | 'producerResume' | 'pause' | 'resume' | 'close');
}
export declare class CreateTransportRequest {
    readonly requestId: string;
    readonly role: 'producing' | 'consuming';
    readonly type = "create-transport-request";
    constructor(requestId: string, role: 'producing' | 'consuming');
}
export type CreateTransportResponsePayload = {
    id: string;
    iceParameters: mediasoup.types.IceParameters;
    iceCandidates: mediasoup.types.IceCandidate[];
    dtlsParameters: mediasoup.types.DtlsParameters;
};
export declare class ConnectTransportRequest {
    readonly requestId: string;
    readonly transportId: string;
    readonly dtlsParameters: mediasoup.types.DtlsParameters;
    readonly type = "connect-transport-request";
    constructor(requestId: string, transportId: string, dtlsParameters: mediasoup.types.DtlsParameters);
}
export type ConnectTransportResponsePayload = {};
export declare class ControlTransportNotification {
    readonly transportId: string;
    readonly action: 'close';
    readonly type = "control-transport-notification";
    constructor(transportId: string, action: 'close');
}
export declare class GetClientStatsRequest {
    readonly requestId: string;
    readonly remoteClientId: string;
    readonly type = "get-client-stats-request";
    constructor(requestId: string, remoteClientId: string);
}
export declare class ClientMonitorSampleNotification {
    readonly sample: string;
    readonly type = "client-monitor-sample-notification";
    constructor(sample: string);
}
export type ObservedScorePayload = {
    score: number;
    timestamp: number;
    remarks: {
        severity: 'none' | 'minor' | 'major' | 'critical';
        text: string;
    }[];
};
export type ObserverGetCallStatsResponse = {
    callScore?: ObservedScorePayload;
    clients: {
        clientId: string;
        clientScore?: ObservedScorePayload;
        peerConnections: {
            peerConnectionId: string;
            peerConnectionScore?: ObservedScorePayload;
            avgRttInMs: number;
            inboundAudioTracks: {
                trackId: string;
                trackScore?: ObservedScorePayload;
                receivingBitrate: number;
                totalLostPackets: number;
            }[];
            inboundVideoTracks: {
                trackId: string;
                trackScore?: ObservedScorePayload;
                receivingBitrate: number;
                totalLostPackets: number;
            }[];
            outboundAudioTracks: {
                trackId: string;
                trackScore?: ObservedScorePayload;
                sendingBitrate: number;
            }[];
            outboundVideoTracks: {
                trackId: string;
                trackScore?: ObservedScorePayload;
                sendingBitrate: number;
            }[];
        }[];
    }[];
};
export type ObservedGetOngoingCallResponse = {
    calls: {
        callId: string;
        clients: {
            clientId: string;
            peerConnections: {
                peerConnectionId: string;
                inboundAudioTrackIds: string[];
                inboundVideoTrackIds: string[];
                outboundAudioTrackIds: string[];
                outboundVideoTrackIds: string[];
            }[];
        }[];
    }[];
};
export type ObserverRequestTypes = {
    'getOngoingCalls': {};
    'getCallStats': {
        callId: string;
    };
};
export declare class ObserverRequest {
    readonly requestId: string;
    readonly operation: UnionizeEvent<ObserverRequestTypes>;
    readonly type = "observer-request";
    constructor(requestId: string, operation: UnionizeEvent<ObserverRequestTypes>);
}
export type RequestMap = {
    [k in CreateProducerRequest['type']]: {
        request: CreateProducerRequest;
        response: CreateProducerResponsePayload;
    };
} & {
    [k in CreateTransportRequest['type']]: {
        request: CreateTransportRequest;
        response: CreateTransportResponsePayload;
    };
} & {
    [k in GetClientStatsRequest['type']]: {
        request: GetClientStatsRequest;
        response: unknown;
    };
} & {
    [k in JoinCallRequest['type']]: {
        request: JoinCallRequest;
        response: JoinCallResponsePayload;
    };
} & {
    [k in ConnectTransportRequest['type']]: {
        request: ConnectTransportRequest;
        response: ConnectTransportResponsePayload;
    };
} & {
    [k in ObserverRequest['type']]: {
        request: ObserverRequest;
        response: ObservedGetOngoingCallResponse | ObserverGetCallStatsResponse;
    };
};
export type NotificationMap = {
    [k in ControlProducerNotification['type']]: ControlProducerNotification;
} & {
    [k in ControlConsumerNotification['type']]: ControlConsumerNotification;
} & {
    [k in ConsumerCreatedNotification['type']]: ConsumerCreatedNotification;
} & {
    [k in TransportConnectedNotification['type']]: TransportConnectedNotification;
} & {
    [k in ClientRtpCapabilitiesNotification['type']]: ClientRtpCapabilitiesNotification;
} & {
    [k in ControlTransportNotification['type']]: ControlTransportNotification;
} & {
    [k in ClientMonitorSampleNotification['type']]: ClientMonitorSampleNotification;
};
export type Request = CreateProducerRequest | CreateTransportRequest | GetClientStatsRequest | JoinCallRequest | ConnectTransportRequest | ObserverRequest;
export declare class Response {
    readonly requestId: string;
    readonly payload?: unknown;
    readonly error?: string | undefined;
    readonly type = "response";
    constructor(requestId: string, payload?: unknown, error?: string | undefined);
}
export type Notification = ControlProducerNotification | ControlConsumerNotification | ConsumerCreatedNotification | TransportConnectedNotification | ClientRtpCapabilitiesNotification | ControlTransportNotification | ClientMonitorSampleNotification;
export type ClientMessage = Request | Response | Notification;
export {};
//# sourceMappingURL=MessageProtocol.d.ts.map