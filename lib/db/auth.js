import * as DB from '#models/db/db';
import bcrypt from 'bcryptjs';
import randomToken from 'random-token';

async function getCollection() {
	const db = await DB.init();
	return db.collection('auth');
}

export async function addUser(name,pass) {
	const collection = await getCollection();
	const exists = await getUserByName(name);
	if (exists) throw new Error('user already exists');

	const hashedPass = await bcrypt.hash(pass,10);
	const {token, authTime} = await newAuthStamp();
	const q = await collection.insertOne({
		username: name,
		password: hashedPass,
		token: token,
		authTime: authTime
	});

	return ({username: name, token: token});
}

export async function loginAttempt(name,pass) {
	const collection = await getCollection();
	const exists = await getFullUserByName(name);
	if (!exists) throw new Error('no user by that name');

	const passwordCompare = await bcrypt.compare(pass, exists.password)
	if (!passwordCompare) throw new Error('password does not match');

	const {token, authTime} = await newAuthStamp();
	const save = await collection.updateOne(
		{_id: DB.toObjectId(exists._id)},
		{$set: {token: token, authTime: authTime}}
	)

	return token;
}

/**
 * checks that token corresponds to user with valid timestamp
 * @param {string} token 
 * @returns {ObjectId,string,string,number} _id, username, token, authTime - user obj
 */
export async function validateToken(token) {
	const collection = await getCollection();
	const expiry = 1000 * 60 * 60 * 24 * 30;

	const exists = await collection.findOne(
		{token: token},
		{projection: {password: 0}}
	);
	if (!exists) throw new Error('token doesnt exist');

	if (new Date().getTime() - exists.authTime > expiry)
		throw new Error('expired token');

	return exists;
}

async function newAuthStamp() {
	const token = await newToken();
	const authTime = new Date().getTime();

	return {token: token, authTime: authTime}
}

export async function getUserByName(name) {
	const collection = await getCollection();
	const q = await collection.findOne(
		{username: name},
		{projection: {password:0}}
	)

	return q;
}

async function getFullUserByName(name) {
	const collection = await getCollection();
	const q = await collection.findOne(
		{username: name}
	)

	return q;
}

async function newToken() {
	const collection = await getCollection();
	let unique, token;
	const generate = () => randomToken(75);
	while (!unique) {
		token = generate();
		const q = await collection.findOne({token: token});
		if (!q) unique = true;
	}

	return token;
}