import * as DB from '#models/db/db';

export async function checkFetchTries(url) {
	const db = await DB.init();
	const collection = db.collection('scrapes');
	const q = await collection.find({ url:url }).toArray();
	if (q.length) 
		return {tries: q[0].tries, time: q[0].lastTime};
	else return {tries: 0, time: 0};
}

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

export async function getOffsetCursor(url) {
	const db = await DB.init();
	const collection = db.collection('scrapes');
	const q = await collection.find({url: url, type: 'cursor'}).toArray();
	const cursor = (q.length) ?  q[0].cursor : false;

	return cursor
}