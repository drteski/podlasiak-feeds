import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
} from '../../processFeed.js';

const mdfFeed = async (
	data,
	{
		mu = 0,
		languages = ['pl'],
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
				id,
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
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			const storeUrl = getStoreUrl('pl', 'Rea');
			const prices = languages.reduce((previousValue, currentValue) => {
				return {
					...previousValue,
					[`${currentValue}_${basePrice[currentValue].currency}`.replace(
						'ga',
						'ie'
					)]: addMuToPrice(basePrice[currentValue].price, mu),
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
				description: description['es'],
				images: images
					.map((image) => storeUrl + 'picture/' + image)
					.join(';'),
				...prices,
			};
		})
		.filter(Boolean);
	return { products, language: languages.join('_').replace('ga', 'ie') };
};

export const generateMdfFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		await mdfFeed(products, config).then(async (data) => {
			await saveFeedFileToDisk(
				data,
				'mdf',
				'csv',
				'../generate/feed/'
			).then(() => resolve());
		});
	});
};
