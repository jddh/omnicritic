import * as DB from '#models/db/db';
import * as titleDB from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';

export async function oneOff() {
	const db = await DB.init();
	const collection = db.collection('titles');
	collection.createIndex( { title : -1 }, function(err, result) {
		console.log(result);
		callback(result);
	 })

	// console.log(q);
}

export async function testNewMC() {
	const db = await DB.init();
	const collection = db.collection('titles');
	await mcrunch.addRatingLoop(5);
}

export async function bulkProcessRatings() {
	await titleDB.bulkProcessRatings();
}