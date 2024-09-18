import * as pino from 'pino';
export type LogLevel = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export declare function createLogger(moduleName: string): pino.P.Logger<never, boolean>;
export declare function setLogLevel(level: LogLevel): void;
//# sourceMappingURL=logger.d.ts.map