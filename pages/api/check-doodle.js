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
		await page.goto(`https://doodle.com/mm/nms/anmeldung`, {
			waitUntil: 'networkidle0',
		});

		const text = await page.evaluate(() => {
			return document.querySelector('body').innerText;
		});
		await browser.close();
		console.log(text);
		res.status(200).send({ text });
	} catch (error) {
		res.status(error.status || 500).end(error.message);
	}
}
