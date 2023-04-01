import * as DB from '#models/db/db';

export async function saveTitles(titles) {
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