const puppeteer = require('puppeteer');

const symbols = ['AAPL', 'TSLA'];

async function requestToDoodle() {
	const text = await getDescription();
	return text;
}

async function getDescription() {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(`https://doodle.com/mm/nms/anmeldung`);

	// await delay(4000);

	let text = null;

	try {
		text = await page.evaluate(() => {
			return document.querySelector('.page-title').innerText;
		});
	} catch {
		console.log('Error!');
	}

	await browser.close();

	return text;
}

requestToDoodle();

module.exports = {
	requestToDoodle,
};
