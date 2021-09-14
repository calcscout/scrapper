const puppeteer = require('puppeteer');
// const iPhone = puppeteer.devices['iPhone 6'];

const symbols = ['AAPL', 'TSLA'];

async function requestToDoodle() {
	const result = await getDescription();
	console.log(result);
	return result;
}

async function evadeChromeHeadlessDetection(page) {
	// Pass the Webdriver Test.
	await page.evaluateOnNewDocument(() => {
		const newProto = navigator.__proto__;
		delete newProto.webdriver;
		navigator.__proto__ = newProto;
	});

	// Pass the Chrome Test.
	await page.evaluateOnNewDocument(() => {
		// We can mock this in as much depth as we need for the test.
		const mockObj = {
			app: {
				isInstalled: false,
			},
			webstore: {
				onInstallStageChanged: {},
				onDownloadProgress: {},
			},
			runtime: {
				PlatformOs: {
					MAC: 'mac',
					WIN: 'win',
					ANDROID: 'android',
					CROS: 'cros',
					LINUX: 'linux',
					OPENBSD: 'openbsd',
				},
				PlatformArch: {
					ARM: 'arm',
					X86_32: 'x86-32',
					X86_64: 'x86-64',
				},
				PlatformNaclArch: {
					ARM: 'arm',
					X86_32: 'x86-32',
					X86_64: 'x86-64',
				},
				RequestUpdateCheckStatus: {
					THROTTLED: 'throttled',
					NO_UPDATE: 'no_update',
					UPDATE_AVAILABLE: 'update_available',
				},
				OnInstalledReason: {
					INSTALL: 'install',
					UPDATE: 'update',
					CHROME_UPDATE: 'chrome_update',
					SHARED_MODULE_UPDATE: 'shared_module_update',
				},
				OnRestartRequiredReason: {
					APP_UPDATE: 'app_update',
					OS_UPDATE: 'os_update',
					PERIODIC: 'periodic',
				},
			},
		};

		window.navigator.chrome = mockObj;
		window.chrome = mockObj;
	});

	// Pass the Permissions Test.
	await page.evaluateOnNewDocument(() => {
		const originalQuery = window.navigator.permissions.query;
		window.navigator.permissions.__proto__.query = (parameters) =>
			parameters.name === 'notifications'
				? Promise.resolve({ state: Notification.permission })
				: originalQuery(parameters);

		// Inspired by: https://github.com/ikarienator/phantomjs_hide_and_seek/blob/master/5.spoofFunctionBind.js
		const oldCall = Function.prototype.call;
		function call() {
			return oldCall.apply(this, arguments);
		}
		Function.prototype.call = call;

		const nativeToStringFunctionString = Error.toString().replace(
			/Error/g,
			'toString'
		);
		const oldToString = Function.prototype.toString;

		function functionToString() {
			if (this === window.navigator.permissions.query) {
				return 'function query() { [native code] }';
			}
			if (this === functionToString) {
				return nativeToStringFunctionString;
			}
			return oldCall.call(oldToString, this);
		}
		Function.prototype.toString = functionToString;
	});

	// Pass the Plugins Length Test.
	await page.evaluateOnNewDocument(() => {
		// Overwrite the `plugins` property to use a custom getter.
		Object.defineProperty(navigator, 'plugins', {
			// This just needs to have `length > 0` for the current test,
			// but we could mock the plugins too if necessary.
			get: () => [1, 2, 3, 4, 5],
		});
	});

	// Pass the Languages Test.
	await page.evaluateOnNewDocument(() => {
		// Overwrite the `plugins` property to use a custom getter.
		Object.defineProperty(navigator, 'languages', {
			get: () => ['en-US', 'en'],
		});
	});

	// Pass the iframe Test
	await page.evaluateOnNewDocument(() => {
		Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
			get: function () {
				return window;
			},
		});
	});

	// Pass toString test, though it breaks console.debug() from working
	await page.evaluateOnNewDocument(() => {
		window.console.debug = () => {
			return null;
		};
	});
}
async function getDescription() {
	const browser = await puppeteer.launch({
		headless: true,
		args: [
			'--disable-infobars',
			'--window-position=0,0',
			'--ignore-certifcate-errors',
			'--ignore-certifcate-errors-spki-list',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--disable-gpu',
			'--window-size=1920x1080',
			'--hide-scrollbars',
		],
	});
	const page = await browser.newPage();
	await evadeChromeHeadlessDetection(page);
	const userAgent =
		'Mozilla/5.0 (X11; Linux x86_64)' +
		'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
	await page.setUserAgent(userAgent);
	// await page.emulate(iPhone);
	await page.goto(`https://doodle.com/mm/nms/anmeldung`);
	await page.waitFor(300);

	const content = await page.content();

	await browser.close();
	return content;

	// let text = null;

	// try {
	// 	text = await page.evaluate(() => {
	// 		return document.querySelector('.page-title').innerText;
	// 	});
	// } catch {
	// 	console.log('Error!');
	// }

	// await browser.close();

	// return text;
}

requestToDoodle();

module.exports = {
	requestToDoodle,
};
