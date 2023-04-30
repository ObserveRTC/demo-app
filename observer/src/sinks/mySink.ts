import { ObserverSinkProcess } from "@observertc/observer-js";

export function createMySink(): ObserverSinkProcess {
	// Save reports from observer into your favorite database
	return async (reports) => {
		const {
			callEventReports
		} = reports;

		for (const callEventReport of callEventReports) {
			// save call event as a row in your database
		}
	}
	
}