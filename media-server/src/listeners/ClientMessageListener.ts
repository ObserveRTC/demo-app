import { ClientMessage } from "../protocols/MessageProtocol"

export type ClientMessageContext = {
	readonly callId?: string,
	clientId: string,
	message: ClientMessage,
	send: (message: ClientMessage) => void,
}
export type ClientMessageListener = (messageContext: ClientMessageContext) => void | Promise<void>