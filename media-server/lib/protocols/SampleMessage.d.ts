import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto2 } from "@bufbuild/protobuf";
/**
 * @generated from message huddle01.observer.schema.SampleMessage
 */
export declare class SampleMessage extends Message<SampleMessage> {
    /**
     * @generated from field: required string serviceId = 1;
     */
    serviceId?: string;
    /**
     * @generated from field: required string mediaUnitId = 2;
     */
    mediaUnitId?: string;
    /**
     * @generated from field: required string roomId = 3;
     */
    roomId?: string;
    /**
     * @generated from field: required string callId = 4;
     */
    callId?: string;
    /**
     * @generated from field: required string clientId = 5;
     */
    clientId?: string;
    /**
     * @generated from field: required string sampleInBase64 = 6;
     */
    sampleInBase64?: string;
    /**
     * @generated from field: optional string peerId = 7;
     */
    peerId?: string;
    /**
     * used when we replay the samples from a previously saved file
     * in this case we should not save the samples again
     *
     * @generated from field: optional bool replay = 8;
     */
    replay?: boolean;
    /**
     * @generated from field: optional string userId = 9;
     */
    userId?: string;
    /**
     * used to add some metadata by the connection received the sample first
     *
     * @generated from field: optional string connectionMetadata = 10;
     */
    connectionMetadata?: string;
    constructor(data?: PartialMessage<SampleMessage>);
    static readonly runtime: typeof proto2;
    static readonly typeName = "huddle01.observer.schema.SampleMessage";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SampleMessage;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SampleMessage;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SampleMessage;
    static equals(a: SampleMessage | PlainMessage<SampleMessage> | undefined, b: SampleMessage | PlainMessage<SampleMessage> | undefined): boolean;
}
//# sourceMappingURL=SampleMessage.d.ts.map