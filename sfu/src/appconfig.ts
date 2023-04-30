const dns = require('dns');
export const argv = require('yargs-parser')(process.argv.slice(2));

async function lookup(hostname: any): Promise<string> {
    return new Promise((resolve) => {
        dns.lookup(hostname, function(err: any, result: string) {
            resolve(result);
        });
    });
}

const appConfigSchema = {
    serverIp: {
        argv: 'serverIp',
        env: 'SERVER_IP',
        doc: 'The IP of the server',
        defaultValue: '127.0.0.1'
    },
    announcedIp: {
        argv: 'announcedIp',
        env: 'ANNOUNCED_IP',
        doc: 'The announced IP the mediasoup will use for RTC connections',
        defaultValue: '127.0.0.1'
    },
    hostname: {
        argv: 'hostname',
        env: 'HOSTNAME',
        doc: 'The hostname of the server',
        defaultValue: 'localhost'
    },
    logLevel: {
        argv: 'logLevel',
        env: 'LOG_LEVEL',
        doc: 'The logLevel of the server',
        defaultValue: 'debug'
    },
    port: {
        argv: 'port',
        env: 'PORT',
        doc: 'The port number the server listens',
        defaultValue: 8080
    },
    rtcMinPort: {
        argv: 'rtcMinPort',
        env: 'RTC_MIN_PORT',
        doc: 'The minimum port the server accepts RTC connections',
        defaultValue: 5000
    },
    rtcMaxPort: {
        argv: 'rtcMaxPort',
        env: 'RTC_MAX_PORT',
        doc: 'The maximum port the server accepts RTC connections',
        defaultValue: 5100
    }
}

type Schema = typeof appConfigSchema;

const loadConfigEntry = <K extends keyof Schema>(key: K, defaultValue?: Schema[K]['defaultValue']): Schema[K]['defaultValue'] => {
    return process.env[appConfigSchema[key]['env']] 
        ?? argv[appConfigSchema[key]['argv']]
        ?? defaultValue
        ?? appConfigSchema[key]['defaultValue']
}

export const help = () => {
    const result = [];
    for (const [key, entry] of Object.entries(appConfigSchema)) {
        result.push(
            `\t--${key}: ${entry.doc} (env: ${entry.env})`,
        )
    }
    return result.join('\n');
}

export const loadConfig = async () => {
    const hostname = loadConfigEntry('hostname');
    const serverIp = await lookup(hostname)
    const result = {
        serverIp: loadConfigEntry('serverIp', serverIp),
        announcedIp: loadConfigEntry('announcedIp'),
        hostname,
        port: loadConfigEntry('port'),
        rtcMinPort: loadConfigEntry('rtcMinPort'),
        rtcMaxPort: loadConfigEntry('rtcMaxPort'),
        logLevel: loadConfigEntry('logLevel'),
    };
    return result;
}
