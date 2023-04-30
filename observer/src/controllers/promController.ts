import { Middleware } from "../common/Middleware";
import { ServerHttpRequest } from "../Server";
import * as Prometheus from 'prom-client';


export function createPromController(promRegistry: Prometheus.Registry): Middleware<ServerHttpRequest> {
	const result = async (input: ServerHttpRequest, next?: (input: ServerHttpRequest) => void) => {
		const { request, response } = input;

		if (!request.url?.startsWith('/metrics')) {
			return next?.(input);
		}
		promRegistry.metrics().then(data => {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(data);
		});
	};
	return result;
}