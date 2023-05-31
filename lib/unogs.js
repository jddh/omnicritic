import * as db from '#models/db/scrapes';
import * as titleDb from '#models/db/titles';
import tetch from '#models/tetch';

/**
 * get one bundle of titles from unogs and save to db
 */
export async function fetchTitlesLoop(format = 'movie') {
	const ts = await getTitles(format);
	await titleDb.saveTitlesFromUnogs(ts.results);
}

/**
 * fetch from unogs using offset cursor
 * @returns JSON
 */
export async function getTitles(format = 'movie') {
	let url = 'https://unogs-unogs-v1.p.rapidapi.com/search/titles?country_list=33&order_by=date&type=' + format;
	const indexedUrl = createUrlForIndexing(url);
	const cursor = await db.getOffsetCursor(indexedUrl);
	if (cursor)
		url += '&offset=' + cursor;

	const options = {
	headers: {
		'X-RapidAPI-Key': '04039288demsh4b5d6be321c7ab3p17378bjsn1001643f10c1',
		'X-RapidAPI-Host': 'unogs-unogs-v1.p.rapidapi.com'
	}
	};

	const rq = await tetch(url, options);
	if (!rq.ok) throw new Error('unogs fetch error');
	const rqj = await rq.json();

	const newCursor = rqj.Object.offset + rqj.Object.limit;
	await db.saveOffsetCursor(indexedUrl,newCursor);

	return rqj;
}

/**
 * reduce complex URL to endpoint
 */
function createUrlForIndexing(url) {
	const uo = new URL(url);
	let params = new URLSearchParams(uo.search);
	params.delete('offset');
	uo.search = params.toString();

	return uo.toString()
}



export function multi() {};