import express from "express";
import cors from "cors";
import * as db from '#models/db/titles';

const app = express();
const PORT = 4000;
const router = express.Router();
app.use("/", router);
app.use(cors());
router.use(cors());

router.get("/rated", async function(req, res) {
	const titles = await db.getRatedTitles(1000);
	
	res.send(titles);

});

router.get("/unrated", async function(req, res) {
	const titles = await db.getUnratedTitles(1000);
	
	res.send(titles);

});

router.get("/all", async function(req, res) {
	const titles = await db.getAllTitles(1000);
	
	res.send(titles);

});

router.get('/about', (req, res) => {
	res.send('about')
  })

app.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});

