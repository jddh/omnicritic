import * as DB from '#models/db/db';

/**
 * return number of fetches on endpoint and last fetch time
 * @param {string} url 
 * @returns {number, number}
 */
export async function checkFetchTries(url) {
	const db = await DB.init();
	const collection = db.collection('scrapes');
	const q = await collection.find({ url:url }).toArray();
	if (q.length) 
		return {tries: q[0].tries, time: q[0].lastTime};
	else return {tries: 0, time: 0};
}

/**
 * log fetch on endpoint, to be counted
 * @param {string} url 
 * @param {boolean} reset reset counter 
 * @returns 
 */
export async function didFetch(url, reset) {
	const db = await DB.init();
	const collection = db.collection('scrapes');
	const q = await collection.find({ url:url, type: 'fetch' }).toArray();
	let changes = { tries: q[0].tries + 1, lastTime: new Date().getTime(), type: 'fetch' };
	if (reset) changes.tries = 0;

	await collection.updateOne(
		{ url:url, type: 'fetch' }, 
		{$set: changes},
		{upsert: true});

	return;
}

/**
 * store cursor on endpoint - preserves url params
 * @param {string} url 
 * @param {number} cursor 
 * @returns 
 */
export async function saveOffsetCursor(url,cursor) {
	const db = await DB.init();
	const collection = db.collection('scrapes');
	await collection.updateOne(
		{url: url},
		{$set : {cursor: cursor, type: 'cursor'}},
		{upsert: true}
	);

	return;
}

/**
 * get cursor on endpoont
 * @param {string} url 
 * @returns 
 */
export async function getOffsetCursor(url) {
	const db = await DB.init();
	const collection = db.collection('scrapes');
	const q = await collection.find({url: url, type: 'cursor'}).toArray();
	const cursor = (q.length) ?  q[0].cursor : false;

	return cursor
}