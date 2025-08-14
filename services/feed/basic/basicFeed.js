import { getStoreUrl, saveFeedFileToDisk } from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';

const basicFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = data
		.map((product) => {
			const { active, id, activeVariant, variantId, sku, ean, weight, stock, producer, aliases, title, description, variantName, basePrice, sellPrice, category, url, attributes, images } =
				product;

			if (sku === '') return;

			const storeUrl = getStoreUrl(language, 'Rea');

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
				sellPrice: addMuToPrice(sellPrice[language].price, mu),
				tax: basePrice[language].tax,
				currency: basePrice[language].currency,
				images: '',
				...images.reduce(
					(prev, curr, index) => ({
						...prev,
						[`img_${index + 1}`]: storeUrl + 'picture/' + curr,
					}),
					{}
				),
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
