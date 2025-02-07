import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	replaceEntities,
	saveFeedFileToDisk,
	titleWithVariantName,
} from '../../processFeed.js';
import {
	connectToGoogleSheets,
	getDataFromSheets,
} from '../../../utilities/googleSheets.js';

const galaxusProductsFeed = async (
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
	const pricesProducts = await connectToGoogleSheets(
		'16uh5wfeEMKlhXKxUAZJs6RKWnuLmZ_BPio5fa3Hcow4'
	).then((document) =>
		getDataFromSheets(document, 'cennik hurt - PL')
			.then((data) => data)
			.then((data) =>
				data.map((item) => ({
					sku: item.SKU,
					price: parseFloat(item['cena\n[PLN]'].replace(',', '.')),
				}))
			)
	);

	const pricesComponents = await connectToGoogleSheets(
		'16uh5wfeEMKlhXKxUAZJs6RKWnuLmZ_BPio5fa3Hcow4'
	).then((document) =>
		getDataFromSheets(document, 'KPL - hurt PL')
			.then((data) => data)
			.then((data) =>
				data.map((item) => ({
					sku: item.SKU,
					price: parseFloat(item['cena\n[PLN]'].replace(',', '.')),
				}))
			)
	);
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
				ProviderKey: sku,
				Gtin: ean,
				BrandName: producer,
				CategoryGroup_1: '',
				ProductCategory: '',
				Weight_g: weight,
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
const galaxusPriceFeed = async (
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
const galaxusStockFeed = async (
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
const galaxusMediaFeed = async (
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

export const generateGalaxusFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await galaxusProductsFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'galaxus_products',
						'csv',
						'../generate/feed/'
					);
				}
			);
			await galaxusPriceFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'galaxus_price',
						'csv',
						'../generate/feed/'
					);
				}
			);
			await galaxusStockFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'galaxus_stock',
						'csv',
						'../generate/feed/'
					);
				}
			);
			await galaxusMediaFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'galaxus_media',
						'csv',
						'../generate/feed/'
					);
				}
			);
		}
		resolve();
	});
};
