import { ObservedCall, Observer } from "@observertc/observer-js";
import { ClientContext } from "../common/ClientContext";
import { createLogger } from "../common/logger";
import { ClientMessageContext } from "./ClientMessageListener";
import { Kafka, Producer } from "kafkajs";
import { SampleMessage } from "../protocols/SampleMessage";
import { MainEmitter } from "../common/MainEmitter";

const logger = createLogger('ClientMonitorSampleNotificatinListener');

export type ClientMonitorSampleNotificatinListenerContext = {
	clients: Map<string, ClientContext>,
	observer: Observer,
	mainEmitter: MainEmitter
}

export function createClientMonitorSampleNotificatinListener(listenerContext: ClientMonitorSampleNotificatinListenerContext) {
	const { 
		observer,
		clients,
		mainEmitter,
	} = listenerContext;
	const result = async (messageContext: ClientMessageContext) => {
		const { 
			message: notification,
		} = messageContext;
		const client = clients.get(messageContext.clientId);
		if (notification.type !== 'client-monitor-sample-notification') {
			return console.warn(`Invalid message type ${notification.type}`);
		} else if (!client) {
			return console.warn(`Client ${messageContext.clientId} not found`);
		} else if (!client.decoder) {
			return console.warn(`Client ${messageContext.clientId} decoder not found`);
		} else if (!client.routerId) {
			return console.warn(`Client ${messageContext.clientId} routerId not found`);
		}

		let observedCall = observer.observedCalls.get(client.routerId);
		if (!observedCall) {
			observedCall = observer.createObservedCall({
				roomId: client.routerId,
				callId: client.routerId,
				serviceId: 'demo-service',
				appData: {
	
				},
			});

			observedCall.once('close', () => {
				// once it is closed
			});
		}

		let observedClient = observedCall.clients.get(client.clientId); 
		if (!observedClient) {
			const newObservedClient = observedCall.createClient({
				clientId: client.clientId,
				userId: client.userId,
				mediaUnitId: 'webapp',
				appData: {
	
				},
			});

			client.webSocket.once('close', () => {
				newObservedClient.close();
				if (newObservedClient.call.clients.size === 0) {
					newObservedClient.call.close();
				}
			});
			observedClient = newObservedClient;
		}

		const sample = client.decoder.decodeFromBase64(notification.sample);

		observedClient.accept(sample);

		mainEmitter.emit('sample', {
			clientId: client.clientId,
			callId: client.routerId,
			mediaUnitId: 'webapp',
			roomId: client.routerId,
			sampleInBase64: notification.sample,
			serviceId: 'demo-service',
			userId: client.userId,
		});
	};

	


	// const consumer = kafka.consumer({
	// 	groupId: 'client-monitor-sample-notification',
	// });

	// consumer.connect().then(() => {
	// 	consumer.subscribe({ topic: 'client-sample' }).then(() => {
	// 		consumer.run({
	// 			eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
	// 					console.log({
	// 							topic,
	// 							partition,
	// 							key: message.key?.toString(),
	// 							value: message.value?.toString(),
	// 							headers: message.headers,
	// 					})
	// 			},
	// 		});
	// 	});
	// });

	return result;
}