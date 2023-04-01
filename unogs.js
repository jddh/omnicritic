import * as db from '#models/db/scrapes';
import tetch from './tetch.js';

export async function getTitles() {
	let url = 'https://unogs-unogs-v1.p.rapidapi.com/search/titles?country_list=33&order_by=date&type=movie';
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
	const rqj = await rq.json();

	const newCursor = rqj.Object.offset + rqj.Object.limit;
	await db.saveOffsetCursor(indexedUrl,newCursor);

	return rqj;
}

function createUrlForIndexing(url) {
	const uo = new URL(url);
	let params = new URLSearchParams(uo.search);
	params.delete('offset');
	uo.search = params.toString();

	return uo.toString()
}



export function multi() {};