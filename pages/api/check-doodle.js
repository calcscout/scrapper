// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { requestToDoodle } from '../../lib/puppeteer-nms';

export default async function checkDoodle(req, res) {
	try {
		const title = await requestToDoodle();
		console.log('Title from Doodle: ', title);
		res.status(200).send({ title });
	} catch (error) {
		res.status(error.status || 500).end(error.message);
	}
}
