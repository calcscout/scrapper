const fetch = require('isomorphic-fetch');
const cheerio = require('cheerio');

async function app() {
	const response = await fetch(`https://doodle.com/mm/nms/anmeldung`);
	const text = await response.text();
	const $ = cheerio.load(text);
	console.log($('body').text().trim());
}

app();
