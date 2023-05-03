import * as db from '#models/db/db';
import * as unogs from '#models/unogs';
import * as mcrunch from '#models/scrape/mcrunch';
import * as roma from '#models/scrape/roma'
import * as titles from '#models/db/titles'
import args from '#models/arguments';
import * as actions from '#models/actions';
import bootstrap from '#models/bootstrap';

await db.init();

if (args('action')) await bootstrap({
	removedupes: async function() {
		await db.removeDuplicates(true);
	},
	ratings: async function() {
		const numberOfTitles = 5;

		await Promise.all([
			mcrunch.addRatingLoop(numberOfTitles),
			roma.addRatingLoop(numberOfTitles)
		]);
	},
	gettitles: async function() {
		await unogs.fetchTitlesLoop();
	},
	status: async function() {
		await titles.statusRatings();
	},
	oneoff: async function() {
		await actions.oneOff();
	},
	newmc: async function() {
		await actions.testNewMC();
	},
	test: function() {
		console.log('we tested');
	}
});

else {
	await unogs.fetchTitlesLoop();

	await mcrunch.addRatingLoop(10);
}

console.log('done!');
db.quit();

