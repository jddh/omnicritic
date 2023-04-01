import Nano from 'nano';

const dbHost = 'http://admin:password@localhost:5984';

export async function load() {
	const db = loadDB();

	const schema = ['title','rating','cover','description','link'];

	// const indexDef = {
	// 	index: { fields: schema },
	// 	name: 'fooindex'
	//   };
	// const r = await db.createIndex(indexDef);

	// db.insert({title: 'toot'});

	const q = {
		selector: {
		  title: 'toot'
		},
		fields: [ "title" ],
		limit:50
	  };
	  const response = await db.find(q)

	console.log(response);
}

function loadDB() {
	let nano = Nano(dbHost);
	return nano.db.use('test');
}

export function test() {

}