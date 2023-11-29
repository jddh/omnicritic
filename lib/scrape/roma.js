import { Scraper, Root, DownloadContent, OpenLinks, CollectContent } from 'nodejs-web-scraper';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import stringSimilarity from 'string-similarity';
import throttledQueue from 'throttled-queue';
import * as db from '#models/db/titles'
import fs from 'fs';

const throttle = throttledQueue(1, 2000);

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
			doc = db.processRatings(doc);
		}
		else (doc.ratings ??= {}).rottentomatoes = {
			timestamp: new Date().getTime()
		}

	}

	if (browser) browser.close();
	await db.saveTitles(q);

	// return Promise.resolve();
}

let browser = false;

/**
 * rate single title doc and resave
 * @param {object} doc - from mongo
 * @returns {number|boolean} score or false
 */
export async function rateAndStore(doc) {
	const rating = await throttle( () => getRatingFromTitle(doc.title,doc.year) );
	if (rating && rating[0]) {
		(doc.ratings ??= {}).rottentomatoes = {
			rating: rating[0],
			timestamp: new Date().getTime()
		}
		if (rating[1]) doc.ratings.rottentomatoes.url = rating[1];
		doc = db.processRatings(doc);
	}
	else (doc.ratings ??= {}).rottentomatoes = {
		timestamp: new Date().getTime()
	}

	await db.saveTitles([doc]);

	return rating[0] ? rating[0] : false;
}

async function getBrowser() {
	let launchOptions = {
		
	};
	if (process.env.CONTAINER) {
		//https://dev.to/cloudx/how-to-use-puppeteer-inside-a-docker-container-568c
		launchOptions.executablePath = '/usr/bin/google-chrome';
		launchOptions.args = ['--no-sandbox', '--disable-setuid-sandbox'];
	}
	if (!browser) browser = await puppeteer.launch(launchOptions);
	// headless: false,
	// devtools: true,
	// executablePath: '/Applications/Google\ Chrome.app'
	return browser;
}

/**
 * scrape title from rotten tomatoes and grab rating
 * @param {string} query name
 * @param {number} year 
 * @returns {[number, string]} [rating,link]
 */
export async function getRatingFromTitle(query,year) {
	const baseUrl = 'https://www.rottentomatoes.com';
	const searchUrl = baseUrl + '/search?search=' + query;


	//puppeteer
	await getBrowser();
	const page = await browser.newPage();
	await page.goto(searchUrl);
	const results = await page.waitForSelector('#search-results');
	let resultsItems = [];
	let insideEl;
	//don't try/catch evaluate() block. if this fails, the RT DOM has changed
	let extracts = await page.evaluate(() => {
		let rows = document.querySelectorAll('search-page-media-row');
		let rowsArray = [];
		let rawRows = [];
		// debugger;
		rows.forEach(r => {
			const title = r.querySelector('[data-qa=info-name]')?.innerText || false;
			const url = r.querySelector('[data-qa=info-name]')?.href || false;
			const rowYear = r.shadowRoot?.querySelector('.year').innerText.match(/\d\d\d\d/gi) || false;
			const rating = 
			r.shadowRoot?.querySelector('score-icon-critic-deprecated').shadowRoot?.querySelector('.percentage').innerText.split('%') || false;

			rowsArray.push({title:title,rating:rating,year:rowYear,url:url});
		});
		return rowsArray;
	})
	page.close();

	//check validity of title
	let validResults = extracts.map(row => {
		const title = row.title;
		if (!title || !query)
			console.log('bad strings when validating metacritic');
		const sim = stringSimilarity.compareTwoStrings(title, query);

		const rowYear = row.year;

		// let correctFormat;
		// if (byline.match(/movie|tv/ig)) correctFormat = true;

		//if year param is present and title year can be scraped, then dq if mismatch
		let correctYear = true;
		if (year) {
			if (rowYear == year) correctYear = true;
			else if (rowYear && rowYear != year) correctYear = false;
		}
		
		if (sim > .7 && correctYear) 
			return [row,sim];
	})
		.filter(i => i); //rm null

	let choice,rating,link;
	if (validResults.length) {
		validResults.sort((a, b) => b[1] - a[1]);
		if (!validResults[0])
			console.log('valid results null err');
		choice = validResults[0][0];
		rating = choice.rating;
		if (!rating || rating == '--') rating = false;
		link = choice.url;
	}

	console.log('Rotten Tomatoes rating scan: ' + query + ' / ' + rating);

	return [rating,link];
}

