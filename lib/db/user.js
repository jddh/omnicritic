import * as DB from '#models/db/db';
import * as auth from '#models/db/auth';

async function getCollection() {
	return DB.getCollection('userdata');
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
			user: userId,
			favourites: title 
		})
		if (q) res.push(true);
		dataOut.push(res);
	}

	return dataOut;
}

/**
 * 
 * @param {string} userId 
 * @returns {string, [string]} {user, favourites}
 */
export async function getFavourites(userId) {
	const collection = await getCollection();
	const q = await collection.findOne(
		{user: userId},
		{projection: {favourites: 1, _id: 0} }
	)

	return q;
}

/**
 * 
 * @param {string} userId 
 * @returns {doc} titles
 */
export async function getFavouritesAsDocs(userId)  {
	const collection = await getCollection();
	const titleColl = DB.getCollection('titles');
	const titleArray = await getFavourites(userId);
	const objIdArray = titleArray.favourites.map(t => DB.toObjectId(t));
	const q = await titleColl.find(
		{_id: {$in: objIdArray}}
	).toArray();

	return q;
}

/**
 * 
 * @param {string} userId 
 * @param {[string]} titleArray 
 * @returns mongo query
 */
export async function addFavourites(userId, titleArray) {
	const collection = await getCollection();
	const q = await collection.updateOne(
		{user: userId},
		{$push: {favourites: {$each: titleArray}}},
		{upsert: true}
	)

	return q;
}

/**
 * 
 * @param {string} userId 
 * @param {[string]} titleArray 
 * @returns mongo query
 */
export async function removeFavourites(userId, titleArray) {
	const collection = await getCollection();
	const q = await collection.updateOne(
		{user: userId},
		{$pull: {favourites: {$in: titleArray} } }
	)

	return q;
}