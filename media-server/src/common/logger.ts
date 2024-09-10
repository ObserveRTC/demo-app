import * as pino from 'pino';

const logger = pino.pino({
	name: 'media-server',
	level: 'debug',
});
const childs: pino.Logger[] = [];
const onChildListener = (child: pino.Logger) => {
	childs.push(child);
	child.onChild = onChildListener;
};

logger.onChild = onChildListener;

export type LogLevel = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export function createLogger(moduleName: string) {
	const child = logger.child({ moduleName });

	return child;
	// return console;
}

export function setLogLevel(level: LogLevel) {
	logger.level = level;
	logger.info(`Log level set to ${level}`);
	childs.forEach((childLogger) => (childLogger.level = logger.level));
}
