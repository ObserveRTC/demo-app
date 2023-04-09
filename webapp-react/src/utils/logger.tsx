export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface Logger {
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
};

export interface WrappedLogger extends Logger {
    init(): void;
    level: LogLevel,
	logger: Logger;
}

export type LoggerFactory = () => Logger;


let defaultLevel: LogLevel = "info";

const wrapLogger = (logger: Logger, logLevel: LogLevel) => {

    let isTrace = false;
    let isDebug = false
    let isInfo = false
    let isWarning = false;
    let isError = false;

    let _level = logLevel;
    let _logger = logger;
    
    const result = new class implements WrappedLogger {
        public init() {
            isTrace = ["trace"].includes(_level);
            isDebug = ["trace", "debug"].includes(_level);
            isInfo = ["trace", "debug", "info"].includes(_level);
            isWarning = ["trace", "debug", "info", "warn"].includes(_level);
            isError = ["trace", "debug", "info", "warn", "error"].includes(_level);
        }
		public get logger() {
			return _logger;
		}
		public set logger(value: Logger) {
			_logger = value;
		}
        public get level() {
            return _level;
        }
        public set level(value: LogLevel) {
            _level = value;
        }
        trace(...args: any[]): void {
            if (isTrace) {
                logger.trace(...args);
            }
        }
        debug(...args: any[]): void {
            if (isDebug) {
                logger.debug(...args);
            }
        }
        info(...args: any[]): void {
            if (isInfo) {
                logger.info(...args);
            }
        }
        warn(...args: any[]): void {
            if (isWarning) {
                logger.warn(...args);
            }
        }
        error(...args: any[]): void {
            if (isError) {
                logger.error(...args);
            }
            
        }
    }
    return result;
}


const createSimpleLogger = () => {
    return {
        trace: (...args: any[]) => {
            /* eslint-disable no-debugger, no-console */
            console.trace(...args);
        },
        debug: (...args: any[]) => {
            /* eslint-disable no-debugger, no-console */
            console.debug(...args);
        },
        info: (...args: any[]) => {
            /* eslint-disable no-debugger, no-console */
            console.info(...args);
        },
        warn: (...args: any[]) => {
            /* eslint-disable no-debugger, no-console */
            console.warn(...args);
        },
        error: (...args: any[]) => {
            /* eslint-disable no-debugger, no-console */
            console.error(...args);
        },
    }
};
const loggers = new Map<string, WrappedLogger>();

export const createLogger = (moduleName: string, logLevel?: LogLevel): Logger => {
	let wrappedLogger = loggers.get(moduleName);
	if (!wrappedLogger) {
        const logger = createSimpleLogger();
		wrappedLogger = wrapLogger(logger, logLevel ?? defaultLevel);
		loggers.set(moduleName, wrappedLogger);
	} else {
		wrappedLogger.level = logLevel ?? defaultLevel;
    }
    wrappedLogger.init();
    return wrappedLogger;
}

export const setLogLevel = (level: LogLevel) => {
    defaultLevel = level;
    for (const wrappedLogger of Array.from(loggers.values())) {
        wrappedLogger.level = level;
        wrappedLogger.init();
    }
};
