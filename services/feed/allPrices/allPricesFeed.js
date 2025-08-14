import { connectToGoogleSheets } from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';

const allPricesFeed = async (data, languages, {}) => {
	return new Promise(async (resolve, reject) => {
		const products = data
			.map((product) => {
				const { id, active, variantId, activeVariant, sku, ean, basePrice, sellPrice } = product;

				const prices = languages
					.map((language) => {
						return {
							[`b_${language}`]: basePrice[language].price,
							[`s_${language}`]: sellPrice[language].price,
						};
					})
					.reduce((previousValue, currentValue) => {
						return { ...previousValue, ...currentValue };
					}, {});
				return {
					id,
					active: active ? '1' : '0',
					variantId,
					activeVariant: activeVariant ? '1' : '0',
					sku,
					ean,
					...prices,
				};
			})
			.filter(Boolean);
		resolve(products);
	});
};

export const generateAllPricesFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		await allPricesFeed(products, config.languages, config).then(async (data) => {
			await connectToGoogleSheets('1GYKRTUfJ-gYO4291-PNRoZVfUjdCllUs_cTK2rbe-4M').then(async (document) => {
				const sheet = await document.sheetsByTitle['PRICES'];
				const headers = Object.keys(data[0]);
				await sheet.setHeaderRow([format(Date.now(), 'dd-MM-yyyy HH:mm:ss'), ...headers]);
				await sheet.clearRows();
				await sheet.addRows(data);
			});
		});
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
