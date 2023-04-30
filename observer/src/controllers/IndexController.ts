import { Middleware } from "../common/Middleware";
import { ServerHttpRequest } from "../Server";

export function createIndexController(): Middleware<ServerHttpRequest> {
	const result = async (input: ServerHttpRequest, next?: (input: ServerHttpRequest) => void) => {
		const { request, response } = input;

		if (request.url !== '/') {
			return next?.(input);
		}
		response.end('ok');
	};
	return result;
}