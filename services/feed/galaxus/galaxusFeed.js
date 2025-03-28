import { prepareProducts, saveFeedFileToDisk, titleWithVariantName } from '../../processFeed.js';
import { connectToGoogleSheets, getDataFromSheets } from '../../../utilities/googleSheets.js';
import { getFinalCategory } from '../../../utilities/category.js';
import { currencyDefaults } from '../../../config/config.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

const pricesProducts = await connectToGoogleSheets('16uh5wfeEMKlhXKxUAZJs6RKWnuLmZ_BPio5fa3Hcow4').then((document) =>
	getDataFromSheets(document, 'cennik hurt - PL')
		.then((data) => data)
		.then((data) =>
			data.map((item) => ({
				sku: item.SKU,
				price: parseFloat(item['cena\n[PLN]'].replace(',', '.')),
			}))
		)
);

const pricesComponents = await connectToGoogleSheets('16uh5wfeEMKlhXKxUAZJs6RKWnuLmZ_BPio5fa3Hcow4').then((document) =>
	getDataFromSheets(document, 'KPL - hurt PL')
		.then((data) => data)
		.then((data) =>
			data.map((item) => ({
				sku: item.SKU,
				price: parseFloat(item['cena\n[PLN]'].replace(',', '.')),
			}))
		)
);

const galaxusWholesalePrices = [...pricesProducts, ...pricesComponents].filter((price) => price.sku !== '');

const galaxusCategories = await connectToGoogleSheets('181kkQgtmSgarZQf5iQBw5gTmJLSsbwIWzymR35Q8FX0').then((document) => getDataFromSheets(document, 'MAPOWANIA').then((data) => data));

const galaxusProductsFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { sku, ean, weight, producer, title, description, variantName } = product;

			const galaxusExistingCategory = galaxusCategories.filter((category) => category.sku.toLowerCase() === sku.toLowerCase());
			const galaxusExistingPrice = galaxusWholesalePrices.filter((price) => price.sku.toLowerCase() === sku.toLowerCase());
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined) return;
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
				Weight_kg: weight,
				ProductTitle_de: titleWithVariantName(title[language], variantName[language]),
				LongDescription_de: getDescription(description, language, producer),
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex((prev) => prev.ProviderKey === currentValue.ProviderKey);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};
const galaxusPriceFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { sku } = product;

			const galaxusExistingCategory = galaxusCategories.filter((category) => category.sku.toLowerCase() === sku.toLowerCase());
			const galaxusExistingPrice = galaxusWholesalePrices.filter((price) => price.sku.toLowerCase() === sku.toLowerCase());
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined) return;
			if (galaxusExistingPrice.length === 0) return;

			return {
				ProviderKey: sku,
				SalesPriceExclVat_EUR: (galaxusExistingPrice[0].price / currencyDefaults.EUR).toFixed(2),
				VatRatePercentage: 8.1,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex((prev) => prev.ProviderKey === currentValue.ProviderKey);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};
const galaxusStockFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { sku, stock } = product;

			const galaxusExistingCategory = galaxusCategories.filter((category) => category.sku.toLowerCase() === sku.toLowerCase());
			const galaxusExistingPrice = galaxusWholesalePrices.filter((price) => price.sku.toLowerCase() === sku.toLowerCase());
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined) return;
			if (galaxusExistingPrice.length === 0) return;

			return {
				ProviderKey: sku,
				QuantityOnStock: stock,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex((prev) => prev.ProviderKey === currentValue.ProviderKey);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};
const galaxusMediaFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.sort((a, b) => a.images.length - b.images.length)
		.map((product) => {
			const { sku, producer, images } = product;

			const galaxusExistingCategory = galaxusCategories.filter((category) => category.sku.toLowerCase() === sku.toLowerCase());
			const galaxusExistingPrice = galaxusWholesalePrices.filter((price) => price.sku.toLowerCase() === sku.toLowerCase());
			if (galaxusExistingCategory.length === 0) return;
			if (galaxusExistingCategory[0].CategoryGroup_1 === undefined) return;
			if (galaxusExistingPrice.length === 0) return;

			const media = imagesUrl(images, language, producer).reduce((previousValue, currentValue, index) => {
				if (index === 0)
					return {
						...previousValue,
						MainImageURL: currentValue,
					};
				return {
					...previousValue,
					[`ImageURL_${index}`]: currentValue,
				};
			}, {});

			return {
				ProviderKey: sku,
				...media,
			};
		})
		.filter(Boolean)
		.reduce((previousValue, currentValue) => {
			const prevIndex = previousValue.findIndex((prev) => prev.ProviderKey === currentValue.ProviderKey);
			if (prevIndex !== -1) return previousValue;
			return [...previousValue, currentValue];
		}, []);
	return { products, language };
};

const galaxusGoogleSheets = (data, options) => {
	return new Promise(async (resolve) => {
		await connectToGoogleSheets('181kkQgtmSgarZQf5iQBw5gTmJLSsbwIWzymR35Q8FX0').then(async (document) => {
			const sheet = await document.sheetsByTitle.MAPOWANIA;
			const rows = await sheet.getRows();
			const sheetData = rows.map((row) => {
				return row.toObject();
			});

			const products = prepareProducts(data, options)
				.map((product) => {
					const { id, active, variantId, sku, producer, title, variantName, category } = product;

					const existing = sheetData.filter((item) => item.sku === sku);

					if (existing.length === 0)
						return {
							id,
							variantId,
							active,
							sku,
							producer,
							title: title.pl,
							variantName: variantName.pl,
							category: getFinalCategory(category.pl),
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
							title: title.pl,
							variantName: variantName.pl,
							category: getFinalCategory(category.pl),
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
						title: title.pl,
						variantName: variantName.pl,
						category: getFinalCategory(category.pl),
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
			await galaxusGoogleSheets(products, config);
			await galaxusProductsFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'galaxus_products', 'csv', '../generate/feed/');
			});
			await galaxusPriceFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'galaxus_price', 'csv', '../generate/feed/');
			});
			await galaxusStockFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'galaxus_stock', 'csv', '../generate/feed/');
			});
			await galaxusMediaFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'galaxus_media', 'csv', '../generate/feed/');
			});
		}
		resolve();
	});
};
