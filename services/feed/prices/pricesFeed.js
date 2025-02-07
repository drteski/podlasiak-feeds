import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	titleWithVariantName,
} from '../../processFeed.js';

const toolightCatalogFeed = async (
	data,
	language,
	{ aliases = ['Rea', 'Tutumi', 'Toolight'] }
) => {
	const products = aliasesFilter(data, aliases)
		.map((product) => {
			const {
				active,
				id,
				activeVariant,
				variantId,
				sku,
				ean,
				weight,
				producer,
				title,
				variantName,
				sellPrice,
				basePrice,
			} = product;

			return {
				active,
				activeVariant,
				id,
				variantId,
				sku,
				ean,
				weight,
				sellPrice: sellPrice[language],
				basePrice: basePrice[language],
				title: titleWithVariantName(
					title[language],
					variantName[language]
				),
				producer,
			};
		})
		.filter(Boolean);
	return { products, language };
};

export const generateToolightCatalogFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await toolightCatalogFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'toolight-catalog',
						'json',
						'../generate/feed/'
					).then(() => resolve());
				}
			);
		}
	});
};
