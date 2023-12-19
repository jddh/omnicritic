import args from '#models/arguments';
import * as db from '#models/db/db';
import * as auth from '#models/db/auth';

await db.init();

const userName = args('user');
const password = args('password');
if (!userName || !password) {
	console.log('missing credentials!');
} else {
	const userCreate = await auth.addUser(userName, password);
	console.log(userCreate);
}

db.quit();