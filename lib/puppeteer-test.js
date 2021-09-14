const puppeteer = require('puppeteer');

async function app() {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(`https://doodle.com/mm/nms/anmeldung`, {
		waitUntil: 'networkidle0',
	});
	// await page.waitForNavigation({
	// 	waitUntil: 'networkidle0',
	// });
	// await page.waitForSelector('.Main-content', {
	// 	visible: true,
	// });
	const text = await page.evaluate(() => {
		return document.querySelector('body').innerText;
	});
	await browser.close();
	console.log(text);
	return text;
}

app();
