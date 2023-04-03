import * as db from '#models/db/db';
import tetch from '#models/tetch';
import * as unogs from '#models/unogs';
import * as mcrunch from '#models/scrape/mcrunch';

await db.init();

// await db.testInsert();

// let t = await unogs.getTitles();

// await db.saveTitlesFromUnogs(t.results);
await unogs.fetchTitlesLoop();

await mcrunch.addRatingLoop(10);

// const q = await mcrunch.getRatingFromTitle('Blade Runner');
// console.log(q);

db.quit();