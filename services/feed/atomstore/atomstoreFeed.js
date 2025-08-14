import { aliasesFilter, excludedFilter, saveFeedFileToDisk, titleWithVariantName } from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';
import { checkProductsInFeed, productsInFeed } from '../../products/utils/productsInFeed.js';

const atomstoreFeed = async (data, language, { name, mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { active, activeVariant, variantId, sku, ean, weight, stock, producer, title, description, variantName, basePrice, images } = product;
			const isInFeed = await checkProductsInFeed(name, variantId, language);
			const newTitle = titleWithVariantName(title[language], variantName[language]);
			if (!isInFeed) {
				if (newTitle.toLowerCase().includes('allegro')) return;
				if (newTitle.toLowerCase().includes('do usuniecia')) return;
				if (newTitle.toLowerCase().includes('do usunięcia')) return;
				if (variantId === '') return;
				if (activeProducts) {
					if (!active) return;
				}
				if (activeVariants) {
					if (!activeVariant) return;
				}
				if (stock < minStock) return;

				if (sku === '') return;
			}

			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				title: newTitle,
				description: getDescription(description, language, producer),
				producer,
				weight,
				stock,
				price: addMuToPrice(basePrice[language].price, mu),
				vat: basePrice[language].tax,
				images: imagesUrl(images, language, aliases).join(';'),
				variantId,
			};
		})
	);
	const finalProducts = products.filter(Boolean).reduce((previousValue, currentValue) => {
		const prevIndex = previousValue.findIndex((prev) => prev.sku === currentValue.sku);
		if (prevIndex !== -1) return previousValue;
		return [...previousValue, currentValue];
	}, []);

	await productsInFeed(name, finalProducts, language);

	return {
		products: finalProducts,
		language,
	};
};
const atomstoreUpdateFeed = async (data, language, { name, mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], options }) => {
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { sku, variantId, ean, stock, basePrice } = product;
			const isInFeed = await checkProductsInFeed(name, variantId, language);
			if (!isInFeed) {
				if (sku === '') return;
			}
			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				stock,
				price: addMuToPrice(basePrice[language].price, mu),
				vat: basePrice[language].tax,
			};
		})
	);
	const finalProducts = products.filter(Boolean).reduce((previousValue, currentValue) => {
		const prevIndex = previousValue.findIndex((prev) => prev.sku === currentValue.sku);
		if (prevIndex !== -1) return previousValue;
		return [...previousValue, currentValue];
	}, []);
	return {
		products: finalProducts,
		language,
	};
};

export const generateAtomstoreFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await atomstoreFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'atomstore', 'csv', '../generate/feed/');
			});
			await atomstoreUpdateFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'atomstore_update', 'csv', '../generate/feed/');
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
