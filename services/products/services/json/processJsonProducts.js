import fs from 'fs';
import { mapSimpleData, mapAliases, mapCategories, mapImages, mapPrices, mapUrls, mapProfilesValues, mapProducers, mapProfiles, mapDescriptions, mapProductFiles } from './valuesMapping.js';

export const processJsonProducts = (fileName, data) => {
	const processedProducts = [];

	const products = JSON.parse(fs.readFileSync(`../public/temp/data/${fileName}`, 'utf8'));

	const { aliases, categories, profiles, profileFields, profileFieldsChoices, producers } = data;
	products.forEach((product) => {
		processedProducts.push({
			aliases: mapAliases(product.aliases, aliases),
			id: product.$id,
			active: product.$active === 'true' ? 1 : 0,
			variantId: '',
			activeVariant: '',
			sku: '',
			ean: '',
			weight: parseFloat(product.$weight),
			title: mapSimpleData(product.titles.title),
			variantName: mapSimpleData([]),
			url: mapUrls(product.urls, aliases),
			stock: 0,
			producer: mapProducers(product.$producer, producers),
			description: mapDescriptions(product.descriptions, aliases),
			categories: mapCategories(product.categories, categories),
			images: mapImages(product.images),
			files: mapProductFiles(product.files, aliases),
			price: mapPrices(product.basePrice),
			promoPrice: mapPrices(product.sellPrice),
			attributes: mapProfiles(product.profiles, profiles, profileFields, profileFieldsChoices),
		});
		if (product.variants.variant === undefined) return;
		if (product.variants.variant.length === undefined) {
			processedProducts.push({
				aliases: mapAliases(product.aliases, aliases),
				id: product.$id,
				active: product.$active === 'true' ? 1 : 0,
				variantId: product.variants.variant.$id,
				activeVariant: product.variants.variant.$isActive === 'true' ? 1 : 0,
				sku: product.variants.variant.$symbol,
				ean: product.variants.variant.$ean,
				weight: parseFloat(product.$weight),
				title: mapSimpleData(product.titles.title),
				variantName: mapSimpleData(product.variants.variant.optionName.name),
				url: mapUrls(product.urls, aliases),
				stock: parseInt(product.variants.variant.stockTotal.stock[0].$quantity),
				producer: mapProducers(product.$producer, producers),
				description: mapDescriptions(product.descriptions, aliases),
				categories: mapCategories(product.categories, categories),
				images: mapImages(product.images),
				files: mapProductFiles(product.files, aliases),
				price: mapPrices(product.variants.variant.basePrice),
				promoPrice: mapPrices(product.variants.variant.sellPrice),
				attributes: mapProfiles(product.profiles, profiles, profileFields, profileFieldsChoices),
			});
		} else {
			product.variants.variant.forEach((variant) => {
				processedProducts.push({
					aliases: mapAliases(product.aliases, aliases),
					id: product.$id,
					active: product.$active === 'true' ? 1 : 0,
					variantId: variant.$id,
					activeVariant: variant.$isActive === 'true' ? 1 : 0,
					sku: variant.$symbol,
					ean: variant.$ean,
					weight: parseFloat(product.$weight),
					title: mapSimpleData(product.titles.title),
					variantName: mapSimpleData(variant.optionName.name),
					url: mapUrls(product.urls, aliases),
					stock: parseInt(variant.stockTotal.stock[0].$quantity),
					producer: mapProducers(product.$producer, producers),
					description: mapDescriptions(product.descriptions, aliases),
					categories: mapCategories(product.categories, categories),
					images: mapImages(product.images),
					price: mapPrices(variant.basePrice),
					promoPrice: mapPrices(variant.sellPrice),
					attributes: mapProfiles(product.profiles, profiles, profileFields, profileFieldsChoices),
				});
			});
		}
	});
	return processedProducts;
};

// processedProducts.push({
// 	aliases: mapAliases(product.aliases, aliases),
// 	id: product.$id,
// 	active: product.$active === 'true' ? 1 : 0,
// 	variantId: '',
// 	activeVariant: 0,
// 	sku: '',
// 	ean: '',
// 	weight: product.$weight,
// 	title: mapSimpleData(product.titles.title),
// 	variantName: mapSimpleData([]),
// 	url: mapUrls(product.urls, aliases),
// 	stock: product.stockTotal.stock[0].$quantity,
// 	producer: mapProducers(product.$producer, producers),
// 	description: mapSimpleData(product.descriptions.description),
// 	categories: mapCategories(product.categories, categories),
// 	images: mapImages(product.images),
// 	price: mapPrices(product.basePrice),
// 	promoPrice: mapPrices(product.basePrice),
// 	attributes: mapProfiles(
// 		product.profiles,
// 		profiles,
// 		profileFields,
// 		profileFieldsChoices
// 	),
// });
