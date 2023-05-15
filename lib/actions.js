import * as DB from '#models/db/db';
import * as titleDB from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';
import * as auth from '#models/db/auth'

export async function oneOff() {
	const q = await auth.validateToken('iy728e5sh0bq21a2ocoqnmthz3048ftq5mshakfthk4o6tljbi9emfhgl6t36xcawbgqfigr8p4');
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