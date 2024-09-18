"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.getConfigString = getConfigString;
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const getDefaultConfig = () => {
    const config = {
        server: {
            port: 9080,
            serverIp: '127.0.0.1',
        },
        mediasoup: {
            workerSettings: {
                logLevel: 'warn',
                logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
                rtcMinPort: 40000,
                rtcMaxPort: 49999,
            },
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                },
            ]
        }
    };
    return config;
};
exports.config = (() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const argv = require('yargs-parser')(process.argv.slice(2));
    const result = getDefaultConfig();
    const configPath = process.env['CONFIG_PATH'] ?? argv['config'];
    if (configPath) {
        const fileContent = fs_1.default.readFileSync(configPath, 'utf-8');
        Object.assign(result, yaml_1.default.parse(fileContent));
    }
    return result;
})();
function getConfigString() {
    const deepCopy = JSON.parse(JSON.stringify(exports.config));
    return JSON.stringify(deepCopy, null, 2);
}
