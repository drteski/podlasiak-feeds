import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	replaceEntities,
	saveFeedFileToDisk,
	titleWithVariantName,
} from '../../processFeed.js';

const atomstoreFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
	}
) => {
	const products = aliasesFilter(data, aliases)
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
				sellPrice,
				images,
			} = product;
			if (variantId === '') return;
			const storeUrl = getStoreUrl(language, 'Rea');

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
				description: description[language],
				producer,
				weight,
				stock,
				price: addMuToPrice(sellPrice[language].price, mu),
				vat: sellPrice[language].tax,
				images: images
					.map((image) => storeUrl + 'picture/' + image)
					.join(';'),
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
	}
) => {
	const products = aliasesFilter(data, aliases)
		.map((product) => {
			const { sku, ean, stock, sellPrice } = product;

			if (sku === '') return;

			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				stock,
				price: addMuToPrice(sellPrice[language].price, mu),
				vat: sellPrice[language].tax,
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
