import { Scraper, Root, DownloadContent, OpenLinks, CollectContent } from 'nodejs-web-scraper';
import * as cheerio from 'cheerio';
import stringSimilarity from 'string-similarity';
import throttledQueue from 'throttled-queue';
import * as db from '#models/db/titles'
import fs from 'fs';

const throttle = throttledQueue(1, 1000);

/**
 * pull titles from db and add ratings
 * @param {number} num number of titles to pull
 */
export async function addRatingLoop(num) {
	const q = await db.getUnratedTitles(num,'metacritic');

	for (let doc of q) {
		const rating = await throttle( () => getRatingFromTitle(doc.title,doc.year) );
		if (rating && rating[0]) {
			(doc.ratings ??= {}).metacritic = {
				rating: rating[0],
				timestamp: new Date().getTime()
			}
			if (rating[1]) doc.ratings.metacritic.url = rating[1];
		}
		else (doc.ratings ??= {}).metacritic = {
			timestamp: new Date().getTime()
		}

	}

	await db.saveTitles(q);

	// return Promise.resolve();
}

/**
 * scrape title from metacritic and grab rating
 * @param {string} query name
 * @param {number} year 
 * @returns 
 */
export async function getRatingFromTitle(query,year) {
	// TODO fallback google scrape
	const baseUrl = 'https://www.metacritic.com';
	const searchUrl = baseUrl + '/search/all/' + query + '/results';

	const scraperConfig = {
        baseSiteUrl: searchUrl,
        startUrl: searchUrl,
        concurrency: 1,
        maxRetries: 3,
		showConsoleLogs: false
    }
	const scraper = new Scraper(scraperConfig);
	const root = new Root();
	const result = new CollectContent('.search_results.module .result', { name: 'result', contentType: 'html' });
	root.addOperation(result);
	await scraper.scrape(root);

	const results = result.getData();
	const jResults = results.map(item => cheerio.load(item.trim()));

	//check validity of title
	let validResults = jResults.map($ => {
		const title = $('.product_title').text().trim();
		if (!title || !query)
			console.log('bad strings when validating metacritic');
		const sim = stringSimilarity.compareTwoStrings(title, query);

		const byline = $('.product_title + p').text().trim();

		let correctFormat;
		if (byline.match(/movie|tv/ig)) correctFormat = true;

		//if year param is present and title year can be scraped, then dq if mismatch
		let correctYear = true;
		if (year) {
			let yearStr = byline.match(/\d\d\d\d/gi)[0];
			if (yearStr == year) correctYear = true;
			else if (yearStr && yearStr != year) correctYear = false;
		}
		
		if (sim > .7 && correctFormat && correctYear) 
			return [$,sim];
	})
		.filter(i => i); //rm null

	let choice,rating,link;
	if (validResults.length) {
		validResults.sort((a, b) => b[1] - a[1]);
		if (!validResults[0])
			console.log('valid results null err');
		choice = validResults[0][0];
		rating = choice('.metascore_w').text();
		if (rating == 'tdb') return false;
		link = baseUrl + choice('.product_title a').attr('href');
	}

	console.log('Metacritic rating scan: ' + query + ' / ' + rating);

	return [rating,link];
}

