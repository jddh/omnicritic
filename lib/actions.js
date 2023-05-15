import * as DB from '#models/db/db';
import * as titleDB from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';
import * as auth from '#models/db/auth'

export async function oneOff() {
	const q = await auth.validateToken('9wbwtoy8ldillrugisotyobtbp2zdpjzqbculo7n91xsjya80ex7lm4vb1uw4favl83elbsbmbz');
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