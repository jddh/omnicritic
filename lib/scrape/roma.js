import { Scraper, Root, DownloadContent, OpenLinks, CollectContent } from 'nodejs-web-scraper';
import puppeteer from 'puppeteer';
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
	const q = await db.getUnratedTitles(num,'rottentomatoes');

	for (let doc of q) {
		const rating = await throttle( () => getRatingFromTitle(doc.title,doc.year) );
		if (rating && rating[0]) {
			(doc.ratings ??= {}).rottentomatoes = {
				rating: rating[0],
				timestamp: new Date().getTime()
			}
			if (rating[1]) doc.ratings.rottentomatoes.url = rating[1];
		}
		else (doc.ratings ??= {}).rottentomatoes = {
			timestamp: new Date().getTime()
		}

	}

	await db.saveTitles(q);
}

/**
 * scrape title from rotten tomatoes and grab rating
 * @param {string} query name
 * @param {number} year 
 * @returns 
 */
export async function getRatingFromTitle(query,year) {
	const baseUrl = 'https://www.rottentomatoes.com';
	const searchUrl = baseUrl + '/search?search=' + query;

	//straight fetch
	// const fe = await fetch(searchUrl);
	// const feb = await fe.blob();
	// const fet = await feb.text();

	//web-scraper
	const scraperConfig = {
        baseSiteUrl: searchUrl,
        startUrl: searchUrl,
        concurrency: 1,
        maxRetries: 3,
		showConsoleLogs: true,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.1 Safari/605.1.15'
		}
    }
	// const scraper = new Scraper(scraperConfig);
	// const root = new Root();
	// const result = new CollectContent('search-page-media-row', { name: 'result', contentType: 'html' });
	// root.addOperation(result);
	// await scraper.scrape(root);

	// const results = result.getData();
	// const jResults = results.map(item => cheerio.load(item.trim()));

	//puppeteer
	const browser = await puppeteer.launch({
		dumpio: true
	  });
	const page = await browser.newPage();
	await page.goto(searchUrl);
	const results = await page.waitForSelector('#search-results');
	let resultsItems = [];
	let insideEl;
	let extracts = await page.evaluate(() => {
		let rows = document.querySelectorAll('search-page-media-row');
		let rowsArray = [];
		rows.forEach(r => {
			const title = r.querySelector('[data-qa=info-name]').innerText;
			const url = r.querySelector('[data-qa=info-name]').href;
			const rating = r.shadowRoot.querySelector('score-icon-critic').shadowRoot.querySelector('.percentage').innerText;

			rowsArray.push({title:title,rating:rating,url:url});
		});
		// insideEl = rows.innerText;
		// console.log('woot!');
		// resultsItems = rowsArray.map(e => e.innerText);
		return rowsArray;


		//works
		const headers = [];
		const elements = document.querySelectorAll("div");
		for (let i = 0; i < elements.length; i++) {
			headers.push(elements[i].innerText);
		}
		return headers;
	})
	// console.log(resultsContent);
	const jResults = [];

	//check validity of title
	let validResults = jResults.map($ => {
		const title = $('[data-qa=info-name]').text().trim();
		if (!title || !query)
			console.log('bad strings when validating metacritic');
		const sim = stringSimilarity.compareTwoStrings(title, query);

		const info = $('.info-wrap').text().trim();

		// let correctFormat;
		// if (byline.match(/movie|tv/ig)) correctFormat = true;

		//if year param is present and title year can be scraped, then dq if mismatch
		let correctYear = true;
		if (year) {
			let yearStr = info.find('info-year').match(/\d\d\d\d/gi)[0];
			if (yearStr == year) correctYear = true;
			else if (yearStr && yearStr != year) correctYear = false;
		}
		
		if (sim > .7 && correctYear) 
			return [$,sim];
	})
		.filter(i => i); //rm null

	let choice,rating,link;
	if (validResults.length) {
		validResults.sort((a, b) => b[1] - a[1]);
		if (!validResults[0])
			console.log('valid results null err');
		choice = validResults[0][0];
		rating = choice('.percentage').text().match(/\d+/gi)[0] || false;
		if (!rating) return false;
		link = baseUrl + choice('[data-qa=info-name]').attr('href');
	}

	console.log('RT rating scan: ' + query + ' / ' + rating);

	return [rating,link];
}

