export function makePrefixedObj(obj: any, prefix?: string, camelCase?: boolean): any {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = camelCase ? key.charAt(0).toUpperCase() + key.slice(1) : key;
        result[`${prefix}${newKey}`] = value;
    }
    return result;
}