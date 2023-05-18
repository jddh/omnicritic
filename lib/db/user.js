import * as DB from '#models/db/db';
import * as auth from '#models/db/auth';

async function getCollection() {
	const db = await DB.init();
	return db.collection('userdata');
}

/**
 * check if user has favourited 1 or more titles
 * @param {string} userId 
 * @param {[string]} titleArray 1 or more title ids
 * @returns {[string, boolean]} [titleId, favourited] status of each titleId
 * 
 */
export async function isFavourite(userId, titleArray) {
	const collection = await getCollection();
	let dataOut = [];
	for (const title of titleArray) {
		//['dfgdf', true]
		let res = [title];
		const q = await collection.findOne({
			user:  	userId  ,
			favourites: title 
		})
		if (q) res.push(true);
		dataOut.push(res);
	}

	return dataOut;
}

export async function getFavourites(userId) {
	const collection = await getCollection();
	const q = await collection.findOne(
		{user: userId},
		{projection: {favourites: 1, _id: 0} }
	)

	return q;
}

export async function addFavourites(userId, titleArray) {
	const collection = await getCollection();
	const q = await collection.updateOne(
		{user: userId},
		{$push: {favourites: {$each: titleArray}}},
		{upsert: true}
	)

	return q;
}

export async function removeFavourites(userId, titleArray) {
	const collection = await getCollection();
	const q = await collection.updateOne(
		{user: userId},
		{$pull: {favourites: {$in: titleArray} } }
	)

	return q;
}