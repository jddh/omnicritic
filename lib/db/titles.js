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
		scrapeDate: new Date().getTime(),
		'ratings.imdb.rating': title.rating
	}))

	//TODO kill "tbd"
	for (const pt of pruned) {
		console.log('saving from unogs: ' + pt.title);
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
	for (let doc of docArray) {
		delete doc._id;
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
export async function getUnratedTitles(num,source = 'metacritic') {
	const db = await DB.init();
	const collection = db.collection('titles');
	// const expireThreshhold = 2600000 // ~ 1 month
	const expireThreshhold = 1000 * 60 * 60 * 24 * 30;
	const expiredScrape = new Date().getTime() - expireThreshhold;
	const q = await collection.find({
		[`ratings.${source}.rating`]: { $exists: false },
		$or: [
			{[`ratings.${source}.timestamp`]: {$lt: expiredScrape}},
			{[`ratings.${source}.timestamp`]: {$exists: false}}
		]
	}).sort( { scrapeDate: -1 }).limit(num).toArray();

	return q;
}

export async function getRatedTitles(num) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const q = await collection.find({
		$or: [
			{'ratings.metacritic.rating': { $exists: true }},
			{'ratings.rottentomatoes.rating': { $exists: true }}
		]
	}).limit(num).toArray();

	return q;
}

export async function getAllTitles(num) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const q = await collection.find().limit(num).toArray();

	return q;
}

export async function getNullRatings(num) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const q = await collection.find({
		$or: [
			{$and: [
			{'ratings.metacritic.timestamp': { $exists: true }},
			{'ratings.metacritic.rating': { $exists: false }}
			]},
			{$and: [
			{'ratings.rottentomatoes.timestamp': { $exists: true }},
			{'ratings.rottentomatoes.rating': { $exists: false }}
			]}
		]
	}).limit(num).toArray();

	return q;
}

export async function statusRatings() {
	const db = await DB.init();
	const collection = db.collection('titles');
	const maxNumber = 5000;
	const allCount = await getAllTitles(maxNumber);
	const ratedCount = await getRatedTitles(maxNumber);
	const unratedCount = await getUnratedTitles(maxNumber);
	const nullCount = await getNullRatings(maxNumber);

	console.log(new Date() + `\ntotal titles: ${allCount.length} \n rated: ${ratedCount.length} \n null rated: ${nullCount.length || 0} \n unrated: ${unratedCount.length}`);
}