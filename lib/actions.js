import * as DB from '#models/db/db';
import * as titleDB from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';
import * as auth from '#models/db/auth';
import * as user from '#models/db/user';

export async function oneOff() {
	const q = await titleDB.getTitleById('6426060d2b3b875ec49c2855');
	const r = await mcrunch.rateAndStore(q);
	console.log(r);
}

export async function testNewMC() {
	const db = await DB.init();
	const collection = db.collection('titles');
	await mcrunch.addRatingLoop(5);
}

export async function bulkProcessRatings() {
	await titleDB.bulkProcessRatings();
}