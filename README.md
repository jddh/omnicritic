# OmniCritic

OmniCritic is a template for a **critic-aggregator-aggregator webapp**. 

Have you ever said *"I wish I could get a easy-to-browse list of *everything* [streaming platform] streams, from best- to worst-ratings averaged across rating aggregators?"* This does that for you. It builds a database of streaming titles, cross-references them with rating aggregators, and builds to a high-performance web frontend.

## IMPORTANT Disclaimer
This is for personal use and, if you build a ratings database, it should probably **not** be shared publicly! Media aggregator websites have EULAs — some of them prohibit scraping and republishing their content. **It is your responsibility** to consider whether information you gather is suitable for storage or publication.

[Live demo](https://jddh.dev/omnicritic) with fake data based on public-domain books

## Moving Parts
1. Node-based CLI for pulling media information from RapidAPI endpoints (such as [UNOGS](https://rapidapi.com/unogs/api/unogs/)) and cross-referencing media titles with rating aggregations (such as IMDB, Metacritic and Rottentomatoes)
2. Node/MongoDB storage schema for all of the above
3. Fast Express API for serving the data
4. Low-dependancy React frontend with routes, auth/watchlists and lots of switches and knobs to browse the data 

## Installation
1. `npm install` dependencies
3. Copy ./.env-example to ./.env; subscribe to [UNOGS](https://rapidapi.com/unogs/api/unogs/) and put your API credentials in .env
4. `docker compose up -d` 
5. Install the database schema and index: `node colonel action=install`
6. Run your first title fetch loop with with `node colonel action=gettitles` (you may want to make a cron job out of this action)
7. Search for rating scores for the titles you've gathered with `node colonel action=ratings` (ditto)
8. Alternatively to scraping, you can import sample data:
   
       curl -s https://jddh.dev/omnicritic/omnicritic-titles.csv | docker exec -i omnicritic-mongodb sh -c 'exec mongoimport --authenticationDatabase=admin  --username=admin --password=password  --db=omnicritic --collection=titles --type=csv --headerline --ignoreBlanks --file='
9. To spin up the frontend, `cd website`, `npm install` and `npm run build:cold`. Then run the frontend profile with `docker compose --profile site up -d`
10. Visit the frontend at `http://localhost:6361` and let your fingers do the walking

## Troubleshooting
- Not getting hits for rating scores? This scraper uses title and year of release to find a valid match. Contrary to how rating aggregators position themselves, they don't carry metadata for evrything. 
- Looking for user creation on the frontend? Auth is stubbed in to facilitate watchlisting, but account creation and management is on you. You can create a new user on the backend with `node newuser user=[user] password=[password]`