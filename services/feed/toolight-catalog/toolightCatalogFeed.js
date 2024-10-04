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
	{
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
	}
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
				description,
				variantName,
				url,
				images,
			} = product;

			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}

			const storeUrl = getStoreUrl('pl', 'Rea');

			return {
				id,
				variantId,
				sku,
				ean,
				weight,
				title: titleWithVariantName(
					title[language],
					variantName[language]
				),
				producer,
				description: description[language],
				url: storeUrl + url[language]['Rea'],
				images: images
					.map((image) => storeUrl + 'picture/' + image)
					.join(';'),
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
