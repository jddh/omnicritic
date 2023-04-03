import * as DB from '#models/db/db';

/**
 * save or update using data in unogs format
 * @param {array} titles 
 * @returns 
 */
export async function saveTitlesFromUnogs(titles) {
	const db = await DB.init();
	const collection = db.collection('titles');
	let pruned = titles.map(title => ({
		title: title.title,
		netflixId: title.netflix_id,
		releaseDate: title.year,
		scrapeDate: new Date().getTime()
	}))

	for (const pt of pruned) {
		await collection.updateOne(
			{netflixId: pt.netflixId,
			scrapeDate: {'$lt': pt.scrapeDate}},
			{$set: pt},
			{upsert: true}
		)
	}

	return;
}

/**
 * update titles already in schema
 * @param {array} docArray 
 */
export async function saveTitles(docArray) {
	const db = await DB.init();
	const collection = db.collection('titles');
	for (const doc of docArray) {
		await collection.updateOne(
			{netflixId: doc.netflixId},
			{$set: doc}
		)
	}
}

/**
 * find titles without ratings, or with expired rating fetch attemtps
 * @param {number} num - amount to get
 * @returns 
 */
export async function getUnratedTitles(num) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const expireThreshhold = 2600000 // ~ 1 month
	const expiredScrape = new Date().getTime() - expireThreshhold;
	const q = await collection.find({
		'ratings.netflix.rating': { $exists: false },
		$or: [
			{'ratings.netflix.timestamp': {$lt: expiredScrape}},
			{'ratings.netflix.timestamp': {$exists: false}}
		]
	}).limit(num).toArray();

	return q;
}