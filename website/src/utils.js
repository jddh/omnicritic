import * as he from 'he';

/**
 * html decode all strings from object
 * @param {object} obj 
 * @returns object
 */
export function heObj(obj) {
	for (const prop in obj) {
		obj[prop] = typeof obj[prop] === 'string' && he.decode(obj[prop]);
	}

	return obj;
}