const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');
const axios = require('axios');

const URI = `https://api.telegram.org/bot${process.env.BOT_ID}/sendMessage?chat_id=${process.env.CHAT_ID}&text=`;

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
	let text = undefined;
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

	const defaultAnswer = 'This Bookable Calendar link is off.';
	if (defaultAnswer === text) {
		text = 'No Changea to the Booking Link';
	} else {
		text =
			'!!!Please check the link, something has changed!!! \n https://doodle.com/mm/nms/anmeldung';
	}

	const path = `${URI}${text}`;

	await axios
		.get(path)
		.then(function (response) {
			// handle success
			console.log(response);
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});

	res.status(200).send({ text });
}
