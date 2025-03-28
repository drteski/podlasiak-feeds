import { prepareProducts, saveFeedFileToDisk, titleWithVariantName } from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

const atomstoreFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { sku, ean, weight, stock, producer, title, description, variantName, basePrice, images } = product;

			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				title: titleWithVariantName(title[language], variantName[language]),
				description: getDescription(description, language, producer),
				producer,
				weight,
				stock,
				price: basePrice[language].price,
				vat: basePrice[language].tax,
				images: imagesUrl(images, language, producer).join(';'),
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex((prev) => prev.sku === currentValue.sku);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};
const atomstoreUpdateFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { sku, ean, stock, basePrice } = product;

			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				stock,
				price: basePrice[language].price,
				vat: basePrice[language].tax,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex((prev) => prev.sku === currentValue.sku);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};

export const generateAtomstoreFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await atomstoreFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'atomstore', 'csv', '../generate/feed/');
			});
			await atomstoreUpdateFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'atomstore_update', 'csv', '../generate/feed/');
			});
		}
		resolve();
	});
};
