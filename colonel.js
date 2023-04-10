import * as db from '#models/db/db';
import tetch from '#models/tetch';
import * as unogs from '#models/unogs';
import * as mcrunch from '#models/scrape/mcrunch';
import args from '#models/arguments';
import * as actions from '#models/actions';
import bootstrap from '#models/bootstrap';

await db.init();

if (args('action')) await bootstrap({
	removedupes: async function() {
		await db.removeDuplicates();
	},
	ratings: async function() {
		await mcrunch.addRatingLoop(20);
	},
	oneoff: async function() {
		await actions.oneOff();
	},
	test: function() {
		console.log('we tested');
	}
});

else {
	await unogs.fetchTitlesLoop();

	await mcrunch.addRatingLoop(10);
}

db.quit();

