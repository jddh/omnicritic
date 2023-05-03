import express from "express";
import cors from "cors";
import compression from 'compression';
import * as db from '#models/db/titles';

const app = express();
const PORT = 4000;
// const router = express.Router();
// app.use("/", router);
app.use(compression());
app.use(cors());
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

app.get("/status", async function(req, res) {
	const titles = await db.statusRatings();
	
	res.send(titles);

});

app.get('/about', (req, res) => {
	res.send('about')
  })

app.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});

