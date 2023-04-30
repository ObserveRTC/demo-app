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
    serviceId: {
        argv: 'serviceId',
        env: 'SERVICE_ID',
        doc: 'The serviceId used in the observer',
        defaultValue: 'observertc'
    },
    mediaUnitId: {
        argv: 'mediaUnitId',
        env: 'MEDIIA_UNIT_ID',
        doc: 'the meida unit id used in the observer',
        defaultValue: 'demo-app'
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
        defaultValue: 7080
    },
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
    const result = {
        serviceId: loadConfigEntry('serviceId'),
        mediaUnitId: loadConfigEntry('mediaUnitId'),
        port: loadConfigEntry('port'),
        logLevel: loadConfigEntry('logLevel'),
    };
    return result;
}
