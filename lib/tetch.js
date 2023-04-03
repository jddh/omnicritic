import * as db from '#models/db/scrapes';

const maxAttempts = 75;

/**
 * fetch within max attempt limit
 * @param {string} url 
 * @param {object} params 
 * @returns Promise<Response>
 */
export default async function tetch(url, params) {
	const urlObj = new URL(url);
	const uri = urlObj.origin + urlObj.pathname;
	let reset = false;

	let ft = await db.checkFetchTries(uri);
	let tries = ft.tries;
	//if the timestamp rolled over to a new day, reset the max
	if (ft && new Date(ft.time).toDateString() != new Date().toDateString()) {
		reset = true;
		tries = 0;
	}

	if (tries++ > maxAttempts) throw new Error('Out of attemps: ' + uri);
	await db.didFetch(uri, reset);

	return fetch(url, params);
}