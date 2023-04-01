import * as db from '#models/db/db';
import tetch from './tetch.js';
import * as unogs from './unogs.js';

await db.init();

// await db.testInsert();

let t = await unogs.getTitles();

await db.saveTitles(t.results);

db.quit();