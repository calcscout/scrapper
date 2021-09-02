const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

export default async function checkDoodle(_req, res) {
	const browser = await puppeteer.launch(
		process.env.NODE_ENV === 'production'
			? {
					args: chrome.args,
					executablePath: await chrome.executablePath,
					headless: chrome.headless,
			  }
			: { headless: false }
	);
	try {
		const page = await browser.newPage();
		// page.setUserAgent(
		// 	'Opera/9.80 (J2ME/MIDP; Opera Mini/5.1.21214/28.2725; U; ru) Presto/2.8.119 Version/11.10'
		// );

		await page.goto(`https://doodle.com/mm/nms/anmeldung`, {
			waitUntil: 'domcontentloaded',
		});

		const scrapedData = await page.evaluate(() => {
			const response = document.querySelector('html')
				? document.querySelector('html').innerHTML
				: 'nothing found';
			return response;
		});

		console.log('scrapedData', scrapedData);

		await page.close();
		await browser.close();
		console.log('Title from Doodle: ', scrapedData);
		res.status(200).send({ scrapedData });
	} catch (error) {
		res.status(error.status || 500).end(error.message);
	}
}
