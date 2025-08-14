import { aliasesFilter, excludedFilter, getStoreUrl, saveFeedFileToDisk } from '../../processFeed.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';

const mdfFeed = async (data, { mu = 0, languages = ['pl'], aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, id, activeVariant, variantId, sku, ean, weight, stock, producer, title, description, variantName, basePrice, images } = product;
			if (variantId === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			const prices = languages.reduce((previousValue, currentValue) => {
				return {
					...previousValue,
					[`${currentValue}_${basePrice[currentValue].currency}`.replace('ga', 'ie')]: addMuToPrice(basePrice[currentValue].price, mu),
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
				images: imagesUrl(images, 'pl', aliases, 'default').join(';'),
				...prices,
			};
		})
		.filter(Boolean);
	return { products, language: languages.join('_').replace('ga', 'ie') };
};

export const generateMdfFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		await mdfFeed(products, config).then(async (data) => {
			await saveFeedFileToDisk(data, 'mdf', 'csv', '../generate/feed/');
		});
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
