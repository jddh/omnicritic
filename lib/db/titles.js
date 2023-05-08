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
		synopsis: title.synopsis,
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
 * calculate colonel rating
 * @param {object} doc 
 * @returns {object} doc
 */
export function processRatings(doc) {
	if (doc.ratings?.metacritic?.rating && doc.ratings?.rottentomatoes?.rating) {
		const omni = Math.ceil((parseInt(doc.ratings.metacritic.rating) + parseInt(doc.ratings.rottentomatoes.rating)) / 2);
		if (omni)
			(doc.ratings.colonel ??= {}).rating = omni.toString();
		else if (doc.ratings.colonel?.rating && doc.ratings.colonel.rating == 'NaN')
			delete doc.ratings.colonel.rating;
		// delete doc.ratings.colonel.omniRating;
	}

	return doc;
}

export async function bulkProcessRatings() {
	const db = await DB.init();
	const collection = db.collection('titles');
	const allDocs = await getAllTitles(5000);
	const modded = allDocs.map(doc => processRatings(doc));
	await saveTitles(modded);
}

export async function getTitleById(id) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const title = await collection.findOne({_id: DB.toObjectId(id)});

	return title;
}

export async function searchTitlesByName(query, limit = 50, fields) {
	const db = await DB.init();
	const collection = db.collection('titles');
	let showFields = {};
	if (fields) {
		fields.forEach(f => showFields[f] = 1);
	}

	// const q = await collection.find({title: {$regex: query, $options: "si"}})
	const q = await collection.find({$text: {$search: query}})
	.limit(limit)
	.project(showFields)
	.toArray();

	return q;
}

/**
 * find titles without ratings, or with expired rating fetch attemtps
 * @param {number} num - amount to get
 * @returns 
 */
export async function getUnratedTitles(num,source = 'metacritic', count = false) {
	const db = await DB.init();
	const collection = db.collection('titles');
	// const expireThreshhold = 2600000 // ~ 1 month
	const expireThreshhold = 1000 * 60 * 60 * 24 * 30;
	const expiredScrape = new Date().getTime() - expireThreshhold;
	const query = {
		[`ratings.${source}.rating`]: { $exists: false },
		$or: [
			{[`ratings.${source}.timestamp`]: {$lt: expiredScrape}},
			{[`ratings.${source}.timestamp`]: {$exists: false}}
		]
	}
	const q = !count ? await collection.find(query).sort( { scrapeDate: -1 }).limit(num).toArray()
	: await collection.countDocuments(query);

	return q;
}

export async function getRatedTitles(num, count = false, sources = ['metacritic','rottentomatoes']) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const sourceQueries = sources.map(s => 
		({[`ratings.${s}.rating`]: { $exists: true }})
	)

	const query = {
		$or: sourceQueries
	}
	const q = count ? await collection.countDocuments(query) : await collection.find(query).limit(num).toArray();

	return q;
}

export async function getAllTitles(num, count = false) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const q = count ? await collection.countDocuments() : await collection.find().limit(num).toArray();

	return q;
}

export async function getNullRatings(num, count = false) {
	const db = await DB.init();
	const collection = db.collection('titles');
	const query = {
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
	}
	const q = count ? await collection.countDocuments(query) : await collection.find(query).limit(num).toArray();

	return q;
}

export async function statusRatings() {
	const db = await DB.init();
	const collection = db.collection('titles');
	const maxNumber = 5000;
	const allCount = await getAllTitles(maxNumber, true);
	const ratedCount = await getRatedTitles(maxNumber, true);
	const unratedCount = await getUnratedTitles(maxNumber, 'metacritic', true);
	const nullCount = await getNullRatings(maxNumber, true);

	console.log(new Date() + `\ntotal titles: ${allCount} \n rated: ${ratedCount} \n null rated: ${nullCount || 0} \n unrated: ${unratedCount}`);

	return {all: allCount, rated: ratedCount, null: nullCount, unrated: unratedCount};
}