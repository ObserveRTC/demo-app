function b64DecodeUnicode(str: string) {
	return decodeURIComponent(
		atob(str).replace(/(.)/g, (m, p) => {
			let code = (p as string).charCodeAt(0).toString(16).toUpperCase();
			if (code.length < 2) {
				code = '0' + code;
			}
			return '%' + code;
		}),
	);
}

export function base64UrlDecode(str: string) {
	let output = str.replace(/-/g, '+').replace(/_/g, '/');
	switch (output.length % 4) {
	case 0:
		break;
	case 2:
		output += '==';
		break;
	case 3:
		output += '=';
		break;
	default:
		throw new Error('base64 string is not of the correct length');
	}

	try {
		return b64DecodeUnicode(output);
	} catch (err) {
		return atob(output);
	}
}

export async function timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
	let timeoutHandle: ReturnType<typeof setTimeout>;

	const timeoutPromise = new Promise<T>((_, reject) =>
		timeoutHandle = setTimeout(() => reject(new Error('Promise timed out')), timeout));

	return Promise.race([ promise, timeoutPromise ]).then((result) => {
		clearTimeout(timeoutHandle);

		return result;
	});
}