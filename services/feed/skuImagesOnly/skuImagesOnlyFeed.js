import dotenv from 'dotenv';
import { saveFeedFileToDisk } from '../../processFeed.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { connectToGoogleSheets } from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';

dotenv.config({ path: '../../.env' });

const skuImagesOnlyFeed = async (data, language, {}) => {
	const products = data
		.sort((a, b) => b.images.length - a.images.length)
		.map((product) => {
			const { sku, images } = product;
			if (sku === '') return;

			const imagesObj = images.slice(0, 20).reduce((acc, img, index) => {
				return {
					...acc,
					[`Image URL ${index + 1}`]: images[index] !== undefined ? `https://lazienka-rea.com.pl/picture/${images[index]}` : '',
				};
			}, {});

			return {
				sku,
				...imagesObj,
			};
		})
		.filter(Boolean);
	await connectToGoogleSheets('1qvXDL4cYm9KXAgShn1_ObV5lETDRZAaaGk9xc3f5eVQ').then(async (document) => {
		const sheet = await document.sheetsByTitle['IMGS'];
		const headers = Object.keys(products[0]);
		await sheet.setHeaderRow([...headers, format(Date.now(), 'dd-MM-yyyy HH:mm:ss')]);
		await sheet.clearRows();
		await sheet.addRows(products);
	});
	return { products, language };
};

export const generateSkuImagesOnlyFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await skuImagesOnlyFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'skuImages', 'csv', '../generate/feed/', ',');
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
