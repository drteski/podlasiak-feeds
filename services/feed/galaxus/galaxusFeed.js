import {
	addMuToPrice,
	aliasesFilter,
	excludedFilter,
	saveFeedFileToDisk,
	titleWithVariantName,
} from '../../processFeed.js';
import {
	connectToGoogleSheets,
	getDataFromSheets,
} from '../../../utilities/googleSheets.js';
import { getFinalCategory } from '../../../utilities/category.js';
import { currencyDefaults } from '../../../config/config.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

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

const galaxusWholesalePrices = [...pricesProducts, ...pricesComponents].filter(
	(price) => price.sku !== ''
);

const galaxusCategories = await connectToGoogleSheets(
	'181kkQgtmSgarZQf5iQBw5gTmJLSsbwIWzymR35Q8FX0'
).then((document) =>
	getDataFromSheets(document, 'MAPOWANIA').then((data) => data)
);

const galaxusProductsFeed = async (
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

			const galaxusExistingCategory = galaxusCategories.filter(
				(category) => category.sku.toLowerCase() === sku.toLowerCase()
			);
			const galaxusExistingPrice = galaxusWholesalePrices.filter(
				(price) => price.sku.toLowerCase() === sku.toLowerCase()
			);
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined)
				return;
			if (galaxusExistingPrice.length === 0) return;

			return {
				ProviderKey: sku,
				Gtin: ean,
				BrandName: producer,
				CategoryGroup_1: galaxusExistingCategory[0].CategoryGroup_1,
				CategoryGroup_2: galaxusExistingCategory[0].CategoryGroup_2,
				CategoryGroup_3: galaxusExistingCategory[0].CategoryGroup_3,
				CategoryGroup_4: galaxusExistingCategory[0].CategoryGroup_4,
				ProductCategory: galaxusExistingCategory[0].ProductCategory,
				Weight_g: weight,
				ProductTitle_de: newTitle,
				LongDescription_de: getDescription(
					description,
					language,
					producer
				),
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex(
				(prev) => prev.ProviderKey === currentValue.ProviderKey
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
		options,
	}
) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, activeVariant, variantId, sku, stock } = product;
			if (variantId === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			if (sku === '') return;

			const galaxusExistingCategory = galaxusCategories.filter(
				(category) => category.sku.toLowerCase() === sku.toLowerCase()
			);
			const galaxusExistingPrice = galaxusWholesalePrices.filter(
				(price) => price.sku.toLowerCase() === sku.toLowerCase()
			);
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined)
				return;
			if (galaxusExistingPrice.length === 0) return;

			return {
				ProviderKey: sku,
				SalesPriceExclVat_EUR: (
					addMuToPrice(galaxusExistingPrice[0].price, mu) /
					currencyDefaults.EUR
				).toFixed(2),
				VatRatePercentage: 8.1,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex(
				(prev) => prev.ProviderKey === currentValue.ProviderKey
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
		options,
	}
) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, activeVariant, variantId, sku, stock } = product;
			if (variantId === '') return;

			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			if (sku === '') return;

			const galaxusExistingCategory = galaxusCategories.filter(
				(category) => category.sku.toLowerCase() === sku.toLowerCase()
			);
			const galaxusExistingPrice = galaxusWholesalePrices.filter(
				(price) => price.sku.toLowerCase() === sku.toLowerCase()
			);
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined)
				return;
			if (galaxusExistingPrice.length === 0) return;

			return {
				ProviderKey: sku,
				QuantityOnStock: stock,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex(
				(prev) => prev.ProviderKey === currentValue.ProviderKey
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
		options,
	}
) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.sort((a, b) => a.images.length - b.images.length)
		.map((product) => {
			const { active, activeVariant, variantId, stock, sku, images } =
				product;
			if (variantId === '') return;

			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			if (sku === '') return;

			const galaxusExistingCategory = galaxusCategories.filter(
				(category) => category.sku.toLowerCase() === sku.toLowerCase()
			);
			const galaxusExistingPrice = galaxusWholesalePrices.filter(
				(price) => price.sku.toLowerCase() === sku.toLowerCase()
			);
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined)
				return;
			if (galaxusExistingPrice.length === 0) return;

			const media = imagesUrl(images, language, aliases).reduce(
				(previousValue, currentValue, index) => {
					if (index === 0)
						return {
							...previousValue,
							MainImageURL: currentValue,
						};
					return {
						...previousValue,
						[`ImageURL_${index}`]: currentValue,
					};
				},
				{}
			);

			return {
				ProviderKey: sku,
				...media,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex(
				(prev) => prev.ProviderKey === currentValue.ProviderKey
			);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};

const galaxusGoogleSheets = (data, aliases) => {
	return new Promise(async (resolve) => {
		await connectToGoogleSheets(
			'181kkQgtmSgarZQf5iQBw5gTmJLSsbwIWzymR35Q8FX0'
		).then(async (document) => {
			const sheet = await document.sheetsByTitle['MAPOWANIA'];
			const rows = await sheet.getRows();
			const sheetData = rows.map((row) => {
				return row.toObject();
			});

			const products = excludedFilter(
				aliasesFilter(data, aliases),
				data.options
			)
				.map((product) => {
					const {
						id,
						active,
						variantId,
						activeVariant,
						sku,
						producer,
						title,
						variantName,
						category,
					} = product;
					if (sku === '') return;
					if (variantId === '') return;
					if (!activeVariant) return;

					const existing = sheetData.filter(
						(item) => item.sku === sku
					);

					if (existing.length === 0)
						return {
							id,
							variantId,
							active,
							sku,
							producer,
							title: title['pl'],
							variantName: variantName['pl'],
							category: getFinalCategory(category['pl']),
							CategoryGroup_1: '',
							CategoryGroup_2: '',
							CategoryGroup_3: '',
							CategoryGroup_4: '',
							ProductCategory: '',
						};

					if (existing[0].CategoryGroup_1 !== '')
						return {
							id,
							variantId,
							active,
							sku,
							producer,
							title: title['pl'],
							variantName: variantName['pl'],
							category: getFinalCategory(category['pl']),
							CategoryGroup_1: existing[0].CategoryGroup_1,
							CategoryGroup_2: existing[0].CategoryGroup_2,
							CategoryGroup_3: existing[0].CategoryGroup_3,
							CategoryGroup_4: existing[0].CategoryGroup_4,
							ProductCategory: existing[0].ProductCategory,
						};
					return {
						id,
						variantId,
						active,
						sku,
						producer,
						title: title['pl'],
						variantName: variantName['pl'],
						category: getFinalCategory(category['pl']),
						CategoryGroup_1: '',
						CategoryGroup_2: '',
						CategoryGroup_3: '',
						CategoryGroup_4: '',
						ProductCategory: '',
					};
				})
				.filter(Boolean)
				.sort((a, b) => {
					if (a.CategoryGroup_1 === '') return 1;
					return -1;
				});

			const headers = Object.keys(products[0]);
			await sheet.setHeaderRow([...headers]);
			await sheet.clearRows();
			await sheet.addRows(products);
		});
		resolve();
	});
};

export const generateGalaxusFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await galaxusGoogleSheets(products, config.aliases);
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
