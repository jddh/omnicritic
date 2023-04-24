import * as DB from '#models/db/db';
import * as mcrunch from '#models/scrape/mcrunch';

export async function oneOffERASE() {
	const db = await DB.init();
	const collection = db.collection('titles');
	const q = await collection.find({'ratings.netflix': {$exists: true}}).toArray();

	for (const doc of q) {
		const ratingPk = doc.ratings.netflix;
		const id = doc._id;
		await collection.updateOne(
			{_id: id},
			{$unset: {'ratings.netflix': ''}}
		)
	}
}

export async function testNewMC() {
	const db = await DB.init();
	const collection = db.collection('titles');
	await mcrunch.addRatingLoop(5);
}

export async function extra() {

}