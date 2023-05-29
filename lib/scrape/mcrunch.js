import { Scraper, Root, DownloadContent, OpenLinks, CollectContent } from 'nodejs-web-scraper';
import * as cheerio from 'cheerio';
import stringSimilarity from 'string-similarity';
import throttledQueue from 'throttled-queue';
import * as db from '#models/db/titles'
import googleIt from 'google-it';

const throttle = throttledQueue(1, 2000);

/**
 * pull titles from db and add ratings
 * @param {number} num number of titles to pull
 */
export async function addRatingLoop(num) {
	const q = await db.getUnratedTitles(num,'metacritic');

	//TODO: save each title after scrape
	for (let doc of q) {
		const rating = await throttle( () => getRatingFromTitle(doc.title,doc.year) );
		if (rating && rating[0]) {
			(doc.ratings ??= {}).metacritic = {
				rating: rating[0],
				timestamp: new Date().getTime()
			}
			if (rating[1]) doc.ratings.metacritic.url = rating[1];
			doc = db.processRatings(doc);
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
 * @returns {[number,string]} rating, link
 */
export async function getRatingFromTitle(query,year) {
	//TODO look into LLM support
	let scrape = await scrapeMCSearch(query,year);

	if (!scrape || !scrape[0])
		scrape = await scrapeGoogleSearch(query,year);

	return scrape;
}

async function scrapeMCSearch(query,year) {
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

	console.log('Metacritic rating scan (direct): ' + query + ' / ' + rating);

	return [rating,link];
}

async function scrapeGoogleSearch(query,year) {
	console.log('MC search failed; trying Google: ' + query);
	let result = false;
	let g = await googleIt({query: `${query} site:metacritic.com`, 'no-display' :true});
	if (!g.length) return result;
	let validResults = [];
	g.forEach(res => {
		let title = res.title.split('-')[0];
		title = title.replace(/[Rr]eviews/gi, '');
		const sim = stringSimilarity.compareTwoStrings(title, query);
		if (sim > .7) validResults.push([res.link,sim]);
	})
	let choice,rating,link;
	if (validResults.length) {
		validResults.sort((a, b) => b[1] - a[1]);
		// validResults.forEach(async vr => {
		for (const vr of validResults) {
			//just fetch and be done with it
			const pageFetch = await throttle(() => fetch(vr[0]));
			const pageFetchB = await pageFetch.blob();
			const pageFetchT = await pageFetchB.text();
			const $ = cheerio.load(pageFetchT);

			const activeNav = $('.primary_nav_item.selected .primary_nav_text').text().trim();
			let correctFormat;
			if (activeNav.match(/movies|tv/ig)) correctFormat = true;

			let correctYear = true;
			if (year) {
				const releaseYear = $('.release_year').text().trim();
				if (releaseYear == year) correctYear = true;
				else if (releaseYear && releaseYear != year) correctYear = false;
			}
			//stop as soon as we get a choice
			if (vr[1] > .7 && correctFormat && correctYear) {
				rating = $('.ms_wrapper .metascore_anchor').text().trim();
				link = vr[0];
				result = [rating,link];
				break;
			}
		}
	}

	console.log('Metacritic rating scan (google): ' + query + ' / ' + rating);
	
	return result;
}