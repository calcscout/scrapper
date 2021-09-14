const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');
const axios = require('axios');

const URI = `https://api.telegram.org/bot${process.env.BOT_ID}/sendMessage?chat_id=${process.env.CHAT_ID}&text=`;

export default async function checkDoodle(_req, res) {
	// let telegramResponse = await axios
	// 	.get(URI + 'Hook trigerred')
	// 	.then(function (response) {
	// 		// handle success
	// 		return response;
	// 	})
	// 	.catch(function (error) {
	// 		// handle error
	// 		console.log(error);
	// 	});

	let text = undefined;
	const defaultAnswer = 'This Bookable Calendar link is off.';

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

		text = await page.evaluate(() => {
			return document.querySelector('body').innerText.substr(0, 35);
		});
		await browser.close();
	} catch (error) {
		res.status(error.status || 500).end(error.message);
	}

	if (text === defaultAnswer) {
		text = 'No Changes on the Booking Link Page';
	} else if (text === undefined) {
		text = 'Server not responding this minute';
	}

	const path = `${URI}${text}`;

	const telegramResponse = await axios
		.get(path)
		.then(function (response) {
			// handle success
			return response;
		})
		.catch(function (error) {
			// handle error
			return error;
		});

	res.status(200).send({ telegramResponse });
}
