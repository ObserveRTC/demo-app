import { Observer } from "@observertc/observer-js";

export function createExports(observer: Observer) {

	// Subscribe to sink events to get the reports
	// and save them into your favorite database / warehouse
	observer.sink.on('inbound-audio-track', ({ reports }) => {
		
	})
}