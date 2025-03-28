import { prepareProducts, saveFeedFileToDisk } from '../../processFeed.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const mdfFeed = async (data, options) => {
	const { languages } = options;
	const products = prepareProducts(data, options)
		.map((product) => {
			const { id, variantId, sku, ean, weight, stock, producer, title, description, variantName, basePrice, images } = product;

			const prices = languages.reduce((previousValue, currentValue) => {
				return {
					...previousValue,
					[`${currentValue}_${basePrice[currentValue].currency}`.replace('ga', 'ie')]: basePrice[currentValue].price,
				};
			}, {});

			return {
				id,
				variantId,
				sku,
				ean,
				weight,
				title: title['es'],
				variantName: variantName['es'],
				stock,
				producer,
				description: getDescription(description, 'es', producer),
				images: imagesUrl(images, 'pl', producer, 'default').join(';'),
				...prices,
			};
		})
		.filter(Boolean);
	return { products, language: languages.join('_').replace('ga', 'ie') };
};

export const generateMdfFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		await mdfFeed(products, config).then(async (data) => {
			await saveFeedFileToDisk(data, 'mdf', 'csv', '../generate/feed/').then(() => resolve());
		});
	});
};
