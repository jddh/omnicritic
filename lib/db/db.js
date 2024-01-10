import { MongoClient, ObjectId } from 'mongodb';

let db,client;

/**
 * connect to mongo, return existing conection if exists
 * @returns {object} mongo Db
 */
export async function init() {
	if (db) return Promise.resolve(db);

	const dbHost = process.env.DB_HOST || 'localhost'
	const url = 'mongodb://admin:password@'+ dbHost +':27017';
	client = new MongoClient(url);

	await client.connect();
	db = client.db('omnicritic');
	connection = db;

	return Promise.resolve(db);
}

/**
 * Create titles collection and associated index for searching
 */
export async function install() {
	const collection = db.collection('titles');
	const estimateCount = await collection.estimatedDocumentCount();
	if (!estimateCount) {
		await collection.insertOne({ title: 'Init' });
		await collection.deleteOne({ title: 'Init' });
	}

	const indexName = 'title_text';
	const indexes = await collection.listIndexes().toArray();
	let isIndexed = [];
	if (indexes.length) {
		isIndexed = indexes.filter(i => i.name == indexName);
		if (isIndexed.length) console.log('Index already exists');
	}
	if (!isIndexed.length) {
		const result = await collection.createIndex(
			{ title: "text" }
		);
		console.log('Titles indexed');
	}

	return Promise.resolve();
}

export let connection;

export function getCollection(name) {
	return db.collection(name);
}

/**
 * rm dupes grouped by netflix id
 * @param {boolean} test - stop at aggregation; do not delete
 */
export async function removeDuplicates(test = false) {
	const collection = db.collection('titles');

	const q = await collection.aggregate([
		{
			$group: {
				_id: {name: "$netflixId"},
				dups: {$addToSet: "$_id",},
				count: {$sum: 1,}
			}
		},
		{
			$match: {"count": {$gt: 1}}
		}
	]).toArray();

	console.log(q);

	if (test) return;

	for (const match of q) {
		let foundNeedle;
		let validItems,invalidItems = [];
		for (const cand of match.dups) {
			const candDoc = await collection.find({_id: cand}).toArray();
			if (candDoc.ratings) {
				foundNeedle = true;
				validItems.push(cand)
			}
			else invalidItems.push(cand)
		}
		if (foundNeedle) {
			//keep one, discard the rest
			validItems.pop();
			invalidItems = invalidItems.concat(validItems);
		} else {
			invalidItems.pop();
		}
		await deleteItemsById(invalidItems);
	}
	console.log('complete');

	return;

	
}

/**
 * delete 1+ items by their ObjectId
 * @param {array} IdArray - ids
 * @param {string} coll - collection
 */
async function deleteItemsById(IdArray,coll = 'titles') {
	const collection = db.collection(coll);
	for (const id of IdArray) {
		await collection.deleteOne({_id: id});
	}

	return;
}

export function toObjectId(id) {
	return new ObjectId(id);
}

// export async function checkFetchTries(url) {
// 	const collection = db.collection('scrapes');
// 	const q = await collection.find({ url:url }).toArray();
// 	if (q.length) 
// 		return {tries: q[0].tries, time: q[0].lastTime};
// 	else return {tries: 0, time: 0};
// }

// export async function didFetch(url, reset) {
// 	const collection = db.collection('scrapes');
// 	const q = await collection.find({ url:url, type: 'fetch' }).toArray();
// 	let changes = { tries: q[0].tries + 1, lastTime: new Date().getTime(), type: 'fetch' };
// 	if (reset) changes.tries = 0;

// 	await collection.updateOne(
// 		{ url:url, type: 'fetch' }, 
// 		{$set: changes},
// 		{upsert: true});

// 	return;
// }

// export async function saveOffsetCursor(url,cursor) {
// 	const collection = db.collection('scrapes');
// 	await collection.updateOne(
// 		{url: url},
// 		{$set : {cursor: cursor, type: 'cursor'}},
// 		{upsert: true}
// 	);

// 	return;
// }

// export async function getOffsetCursor(url) {
// 	const collection = db.collection('scrapes');
// 	const q = await collection.find({url: url, type: 'cursor'}).toArray();
// 	const cursor = (q.length) ?  q[0].cursor : false;

// 	return cursor
// }

// export async function saveTitles(titles) {
// 	const collection = db.collection('titles');
// 	let pruned = titles.map(title => ({
// 		title: title.title,
// 		netflixId: title.netflix_id,
// 		releaseDate: title.year,
// 		imdbId: title.imdb_id,
// 		synopsis: title.synopsis,
// 		scrapeDate: new Date().getTime()
// 	}))

// 	for (const pt of pruned) {
// 		await collection.updateOne(
// 			{netflixId: pt.netflixId,
// 			scrapeDate: {'$lt': pt.scrapeDate}},
// 			{$set: pt},
// 			{upsert: true}
// 		)
// 	}

// 	return;
// }

export async function testInsert() {
	const collection = db.collection('titles');
	let insert = await collection.insertOne({
		title: 'Master and Commander',
		metaRating: 9.5,
		releaseDate: 45645677,
		scrapeDate: 456454645,
		genre: 'action'
	});
	console.log(insert);

	return Promise.resolve();
}

export function quit() {
	client.close();
}