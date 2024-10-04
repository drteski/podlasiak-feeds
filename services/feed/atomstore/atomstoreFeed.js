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

			titleWithVariantName(title[language], variantName[language]);

			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			const storeUrl = getStoreUrl(language, 'Rea');

			return {
				active: stock > 0 ? 1 : 0,
				sku,
				ean,
				title: titleWithVariantName(
					title[language],
					variantName[language]
				),
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
		.filter(Boolean);
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
		}
		resolve();
	});
};
