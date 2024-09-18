import type { MediasoupServiceConfig } from './services/MediasoupService';
import type { ServerConfig } from './Server';
export type Config = {
    server: ServerConfig;
    mediasoup: MediasoupServiceConfig;
};
export declare const config: Config;
export declare function getConfigString(): string;
//# sourceMappingURL=config.d.ts.map