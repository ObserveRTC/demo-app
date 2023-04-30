
export type Middleware<T> = (input: T, next?: (input: T) => Promise<void>) => Promise<void>;

export type Processor<T> = (input: T) => void;

export function createProcessor<T>(...middlewares: Middleware<T>[]): Processor<T> {
	const createVisitor = () => {
		let lastVisited = -1;
		const visitMiddleware = (input: T, index: number) => {
			if (index != lastVisited + 1) {
				throw new Error(`Each middleware must be visited sequentially and only once`);
			}
			lastVisited = index;
			if (middlewares.length <= index) {
				return;
			}
	
			middlewares[index](input, async () => visitMiddleware(input, index + 1));
		};
		return (input: T) => visitMiddleware(input, 0);
	}
	return (input: T) => createVisitor()(input);
}