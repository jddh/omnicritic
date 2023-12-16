# OmniCritic

OmniCritic is a template for a **critic-aggregator-aggregator webapp**. 

It is in the interest of media vendors to not show aggregate ratings for their libraries. That's how they get you. Have you ever said "[self,] I wish I could get a easy-to-browse list of *everything* [media vendor] streams, from best- to worst-ratings averaged across rating aggregators? No? Well you are a patient person. At any rate, that's what this does.

## IMPORTANT Disclaimer!
This is for personal use and, if you build a ratings database, it should probably **not** be shared! Media aggregator websites have EULAs -- some of them prohibit scraping and republishing their content. **It is your responsibility** to consider whether information you gather is suitable for storage or publication.

[Live demo]() with fake data based on public-domain books

## Moving Parts
1. Node.js data fetching system for pulling media information from RapidAPI endpoints (such as UNOGS) and cross-referencing media titles with rating aggregations (such as IMDB, Metacritic and Rottentomatoes)
2. Node/MongoDB storage schema for all of the above
3. Simple Express API for serving the data
4. A bespoke, low-dependancy React frontend with routes, auth/watchlists and lots of switches and knobs to browse the data 

## Installation
1. `node i` dependencies
1. Subscribe to UNOGS and put your API credentials in ./.env
2. `docker compose up -d` 
3. Install the database schema `CODE HERE`
4. Run your first title fetch loop with with `node colonel action=titles` (you may want to make a cron job out of this action)
5. Search for rating scores for the titles you've gathered with `node colonel action=ratings` (ditto)
6. Alternatively to scraping, you can import sample data with `DOCKER CMD`
7. Visit the frontend at `http://localhost:6361` and let your fingers do the walking

## Troubleshooting
- Not getting hits for rating scores? This scraper uses title and year of release to find a valid match. Contrary to how rating aggregators position themselves, they don't carry metadata for evrything. You can see the results of individual queries with the `-v` flag, eg. `node colonel action=ratings -v`
- No frontend for user creation? Auth is stubbed in to facilitate watchlisting, but account creation and management is on you. You can create a new user on the backend with `node newuser user=[user] pass=[password]`