import express from "express";
import cors from "cors";
import compression from 'compression';
import * as db from '#models/db/titles';
import * as auth from '#models/db/auth';

const app = express();
const PORT = 4000;
// const router = express.Router();
// app.use("/", router);
app.use(compression());
app.use(cors());
app.use(express.json());
// router.use(cors());
// router.use(compression());

app.get("/rated", async function(req, res) {
	const titles = await db.getRatedTitles(1000);
	
	res.send(titles);

});

app.get("/unrated", async function(req, res) {
	const titles = await db.getUnratedTitles(5000);
	
	res.send(titles);

});

app.get("/all", async function(req, res) {
	const titles = await db.getAllTitles(5000);
	
	res.send(titles);

});

app.get("/title/:titleId", async function(req, res) {
	const title = await db.getTitleById(req.params.titleId);

	res.send(title);
})

app.get("/title/search/:query", async function(req, res) {
	const query = await db.searchTitlesByName(req.params.query, 10, ['title','_id']);

	res.send(query);
})

app.get("/search/:query", async function(req, res) {
	const query = await db.searchTitlesByName(req.params.query, 100);

	res.send(query);
})

app.get("/status", async function(req, res) {
	const titles = await db.statusRatings();
	
	res.send(titles);

});

app.get('/user', async function(req, res) {
	let resObj = {}, status = 401;
	const token = req.get('Authorization').replace('Basic ','');
	if (token) {
		try {
			const q = await auth.validateToken(token);
			console.log(q);
			if (q) {
				status = 200;
				resObj = q;
			}
		} 
		catch(e) {

		}
	}

	res.status(status).send(resObj);
})

app.post("/login", async function(req, res) {
	let message, resObj = {}, status = 400;
	const body = req.body;
	const [user,pass] = [body.username, body.password];
	if (!user || !pass) message = 'missing username or password';
	if (!Object.keys(body).length) message = 'no credentials set';

	if (user && pass) {
		let token;
		try {
			const q = await auth.loginAttempt(user,pass);
			token = q;
		} catch(e) {
			console.log('login error: ' + e.message);
			status = 401;
			message = 'bad credentials';
		}
		if (token) {
			status = 200;
			resObj.token = token;
		}
	}

	res.status(status).json({...resObj, message: message});
})

app.get('/about', (req, res) => {
	res.send('about')
  })

app.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});

