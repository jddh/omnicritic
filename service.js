import express from "express";
import cors from "cors";
import compression from 'compression';
import 'dotenv/config';
import * as db from '#models/db/titles';
import * as mcrunch from '#models/scrape/mcrunch';
import * as roma from '#models/scrape/roma';
import * as auth from '#models/db/auth';
import * as user from '#models/db/user';

const app = express();
const PORT = 4000;
app.use(compression());
app.use(cors({
	origin: process.env.CORS_DOMAIN,
	optionsSuccessStatus: 200
}));
app.use(express.json());

function cacheResponse(res, seconds = 10) {
	return res.set({ 'Cache-Control': `max-age=${seconds}, must-revalidate` });
}

app.get("/rated", async function (req, res, next) {
	safeAsync(next, async () => {
		const titles = await db.getRatedTitles(5000);
		// await wait(1000);

		cacheResponse(res).send(titles);
		// res.status(500).send();
		// res.send(titles);
	})
});

app.get("/unrated", async function (req, res, next) {
	safeAsync(next, async () => {
		const titles = await db.getUnratedTitles(5000, ['metacritic', 'rottentomatoes']);

		cacheResponse(res).send(titles);
	})
});

app.get("/all", async function (req, res, next) {
	safeAsync(next, async () => {
		const titles = await db.getAllTitles(5000);

		cacheResponse(res).send(titles);
	})
});

app.get("/nullrated", async function (req, res, next) {
	safeAsync(next, async () => {
		// await throwError(req);
		const titles = await db.getNullRatings(5000);
		cacheResponse(res).send(titles);
	})

	//

	// makeError(req)
	// .then(r => db.getNullRatings(5000))
	// .then(r => cacheResponse(res).send(r))
	// .catch(e => next(e))
});

app.get("/title/:titleId", async function (req, res, next) {
	safeAsync(next, async () => {
		const title = await db.getTitleById(req.params.titleId);

		cacheResponse(res, 60).send(title);
	})
})

//BUG often gets null result
app.get("/title/search/:query", async function (req, res, next) {
	safeAsync(next, async () => {
		const query = await db.searchTitlesByName(req.params.query, 10, ['title', '_id']);

		cacheResponse(res).send(query);
	})
})

app.get("/search/:query", async function (req, res, next) {
	safeAsync(next, async () => {
		const query = await db.searchTitlesByName(req.params.query, 100);

		cacheResponse(res).send(query);
	})
})

/**
 * status of title ratings {all, rated, null, unrated}
 */
app.get("/status", async function (req, res, next) {
	safeAsync(next, async () => {
		const valid = await validateAuthenticatedRq(req);
		if (!valid) return res.status(401).send('');

		const titles = await db.statusRatings();

		res.status(200).send(titles);
	})
});

app.get('/user', function (req, res, next) {
	safeAsync(next, async () => {
		validateAuthenticatedRq(req)
		.then(v => {
			if (!v) res.status(401).send('');

			res.status(200).send(v);
		})
	})
});

app.post('/title/get/rate', async function (req, res, next) {
	safeAsync(next, async () => {
		const valid = await validateAuthenticatedRq(req);
		if (!valid) return res.status(401).send('');

		const body = req.body;
		const titleID = body.id;
		const source = body.source
		const sourceLib = (source == 'metacritic') ? mcrunch : roma;

		const titleDoc = await db.getTitleById(titleID);
		const ratingQ = await sourceLib.rateAndStore(titleDoc);

		if (ratingQ !== undefined) res.status(200).send(ratingQ);
		else res.status(406).send('');
	})
})

app.get('/user/favourites', async function (req, res, next) {
	safeAsync(next, async () => {
		const valid = await validateAuthenticatedRq(req);
		if (!valid) return res.status(401).send('');

		const q = await user.getFavourites(valid._id);

		res.send(q || []);
	})
})

app.get('/user/favourites/docs', async function (req, res, next) {
	safeAsync(next, async () => {
		const valid = await validateAuthenticatedRq(req);
		if (!valid) return res.status(401).send('');

		const q = await user.getFavouritesAsDocs(valid._id);

		res.send(q);
	})
})

app.post('/user/favourites', async function (req, res, next) {
	safeAsync(next, async () => {
		const valid = await validateAuthenticatedRq(req);
		if (!valid) return res.status(401).send('');

		const body = req.body;
		const userID = valid._id;
		const titleArray = body.titles;

		const q = await user.addFavourites(userID, titleArray);

		if (q.modifiedCount) res.status(200).send('');
		else res.status(406).send('');
	})
})

app.post('/user/favourites/remove', async function (req, res, next) {
	safeAsync(next, async () => {
		const valid = await validateAuthenticatedRq(req);
		if (!valid) return res.status(401).send('');

		const body = req.body;
		const userID = valid._id;
		const titleArray = body.titles;

		const q = await user.removeFavourites(userID, titleArray);

		if (q.modifiedCount) res.status(200).send('');
		else res.status(406).send('');
	})
})

async function validateAuthenticatedRq(req) {
	if (!req.get('Authorization')) return false;
	const token = req.get('Authorization').replace('Basic ', '');
	if (token) {
		try {
			const q = await auth.validateToken(token);
			if (q) {
				q._id = q._id.toString();;
				return q;
			}
		}
		catch (e) {
			return false;
		}
	}
}

async function validatePermittedRq(req) {

}

app.post("/login", async function (req, res, next) {
	safeAsync(next, async () => {
		let message, resObj = {}, status = 400;
		const body = req.body;
		const [user, pass] = [body.username, body.password];
		if (!user || !pass) message = 'missing username or password';
		if (!Object.keys(body).length) message = 'no credentials set';

		if (user && pass) {
			let token;
			try {
				const q = await auth.loginAttempt(user, pass);
				token = q;
			} catch (e) {
				console.log('login error: ' + e.message);
				status = 401;
				message = '401';
			}
			if (token) {
				status = 200;
				resObj.token = token;
			}
		}

		res.status(status).json({ ...resObj, message: message });
	})
})

app.post('/logout', async function (req, res, next) {
	safeAsync(next, async () => {
		const body = req.body;
		const token = body.token;

		const q = await auth.removeToken(token);

		if (q.modifiedCount) res.status(200).send('');
		else res.status(406).send('');
	})
})

app.listen(PORT, function () {
	console.log("Server is running on Port: " + PORT);
});

//protect async middleware with try/catch
async function safeAsync(next, fn) {
	try { await fn() }
	catch (e) { next(e) }
}

function wait(time) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), time);
	})
}

async function throwError(req) {
	throw new Error('test error handling');
}