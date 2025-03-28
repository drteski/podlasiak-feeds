import { prepareProducts, saveFeedFileToDisk } from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

const basicFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { id, variantId, sku, ean, weight, producer, title, description, variantName, basePrice, sellPrice, images } = product;

			return {
				id,
				variantId,
				sku,
				ean,
				weight,
				producer,
				title: title[language],
				description: getDescription(description, language, producer),
				variantName: variantName[language],
				sellPrice: sellPrice[language].price,
				tax: basePrice[language].tax,
				currency: basePrice[language].currency,
				images: imagesUrl(images, language, producer).join(';'),
			};
		})
		.filter(Boolean);
	return { products, language };
};

export const generateBasicFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await basicFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'basic', 'csv', '../generate/feed/');
			});
		}
		resolve();
	});
};
