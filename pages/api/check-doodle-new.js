const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

export default async function checkDoodle(_req, res) {
	console.log(process.env.NODE_ENV);
	const browser = await puppeteer.launch(
		process.env.NODE_ENV === 'production'
			? {
					args: chrome.args,
					executablePath: await chrome.executablePath,
					headless: chrome.headless,
			  }
			: {}
	);

	const page = await browser.newPage();
	page.setUserAgent(
		'Opera/9.80 (J2ME/MIDP; Opera Mini/5.1.21214/28.2725; U; ru) Presto/2.8.119 Version/11.10'
	);
	await page.goto(`https://doodle.com/mm/nms/anmeldung`);

	let title = null;

	try {
		title = await page.evaluate(() => {
			return document.querySelector('.page-title').innerText;
		});
	} catch (error) {
		console.log('Error!', error);
		res.status(error.status || 500).end(error.message);
	}

	await browser.close();
	console.log('Title from Doodle: ', title);
	res.status(200).send({ title });
}
