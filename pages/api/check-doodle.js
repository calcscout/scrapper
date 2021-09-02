const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

export default async function checkDoodle(_req, res) {
	const browser = await puppeteer.launch(
		process.env.NODE_ENV === 'production'
			? {
					args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
      ],
					executablePath: await chrome.executablePath,
					headless: chrome.headless,
			  }
			: { headless: false }
	);
	try {
		const page = await browser.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36'
		);

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
