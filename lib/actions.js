import * as DB from '#models/db/db';
import * as titleDB from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';

export async function oneOff() {
	const db = await DB.init();
	const collection = db.collection('titles');
	const q = await titleDB.searchTitlesByName('each');

	console.log(q);
}

export async function testNewMC() {
	const db = await DB.init();
	const collection = db.collection('titles');
	await mcrunch.addRatingLoop(5);
}

export async function bulkProcessRatings() {
	await titleDB.bulkProcessRatings();
}