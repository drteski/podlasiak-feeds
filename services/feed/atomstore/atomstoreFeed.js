import {
	addMuToPrice,
	aliasesFilter,
	excludedFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	titleWithVariantName,
} from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

const atomstoreFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
		options,
	}
) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const {
				active,
				activeVariant,
				variantId,
				sku,
				ean,
				weight,
				stock,
				producer,
				title,
				description,
				variantName,
				basePrice,
				images,
			} = product;
			if (variantId === '') return;

			const newTitle = titleWithVariantName(
				title[language],
				variantName[language]
			);
			if (newTitle.toLowerCase().includes('allegro')) return;
			if (newTitle.toLowerCase().includes('do usuniecia')) return;
			if (newTitle.toLowerCase().includes('do usunięcia')) return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			if (sku === '') return;

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
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex(
				(prev) => prev.sku === currentValue.sku
			);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};
const atomstoreUpdateFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
		options,
	}
) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { sku, ean, stock, basePrice } = product;

			if (sku === '') return;

			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				stock,
				price: addMuToPrice(basePrice[language].price, mu),
				vat: basePrice[language].tax,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex(
				(prev) => prev.sku === currentValue.sku
			);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};

export const generateAtomstoreFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await atomstoreFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'atomstore',
						'csv',
						'../generate/feed/'
					);
				}
			);
			await atomstoreUpdateFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'atomstore_update',
						'csv',
						'../generate/feed/'
					);
				}
			);
		}
		resolve();
	});
};
