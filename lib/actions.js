import * as DB from '#models/db/db';
import * as titleDB from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';
import * as auth from '#models/db/auth';
import * as user from '#models/db/user';

export async function oneOff() {
	const q = await auth.removeToken('mjpuclzeufmnm8y7x3qw8rj2dhs1li1lhrlv3cg32033n7ng7xjp6azib0b24ygurd6uzwws2rm');
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