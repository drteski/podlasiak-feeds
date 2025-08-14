import dotenv from 'dotenv';
import { aliasesFilter, excludedFilter, saveFeedFileToDisk, titleWithVariantName } from '../../processFeed.js';
import { getFinalCategory } from '../../products/utils/finalCategory.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { checkProductsInFeed, productsInFeed } from '../../products/utils/productsInFeed.js';

dotenv.config({ path: '../../.env' });

const bricoBravoFeed = async (data, language, { name, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { active, activeVariant, variantId, sku, ean, stock, sellPrice, basePrice, description, producer, title, variantName, weight, images, category } = product;
			const isInFeed = await checkProductsInFeed(name, variantId, language);
			if (!isInFeed) {
				if (sku === '') return;
				if (ean === '') return;
				if (variantId === '') return;
				if (activeProducts) {
					if (!active) return;
				}
				if (activeVariants) {
					if (!activeVariant) return;
				}
				if (stock < minStock) return;
			}
			const imagesObj = Array.from(Array(10).keys()).reduce((acc, i) => {
				return {
					...acc,
					[`Image URL ${i + 1}`]: images[i] !== undefined ? `https://lazienka-rea.com.pl/picture/${images[i]}` : '',
				};
			}, {});

			return {
				'Sku EAN/GTIN': ean,
				'Category': getFinalCategory(category[language], false),
				'Brand': producer,
				'ProductName': titleWithVariantName(title[language], variantName[language]),
				'Url': '.',
				'Weight': weight,
				'Product Description': description[language][producer],
				...imagesObj,
				'Selling Price (Price to GPP)': basePrice[language].price,
				'Discounted Price': sellPrice[language].price,
				'Vat': 22,
				'Available Quantity': stock,
				'Processing Time': 3,
				'Product_Code': sku,
				variantId,
			};
		})
	);
	const finalProducts = products.filter(Boolean);
	await productsInFeed(name, finalProducts, language);

	return {
		products: finalProducts.map((product) => {
			delete product.variantId;
			return product;
		}),
		language,
	};
};
const bricoBravoFeedStockUpdate = async (data, language, { name, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { active, activeVariant, variantId, sku, ean, stock, sellPrice, basePrice } = product;
			const isInFeed = await checkProductsInFeed(name, variantId, language);
			if (!isInFeed) {
				if (sku === '') return;
				if (ean === '') return;
				if (variantId === '') return;
				if (activeProducts) {
					if (!active) return;
				}
				if (activeVariants) {
					if (!activeVariant) return;
				}
				if (stock < minStock) return;
			}
			return {
				'Sku EAN/GTIN': ean,
				'Selling Price (Price to GPP)': basePrice[language].price,
				'Discounted Price': sellPrice[language].price,
				'Available Quantity': stock,
				'Processing Time': 3,
				'Product_Code': sku,
			};
		})
	);

	return { products: products.filter(Boolean), language };
};

export const generateBricoBravoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await bricoBravoFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'bricoBravo', 'csv', '../generate/feed/', ',');
			});
			await bricoBravoFeedStockUpdate(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'bricoBravo_update', 'csv', '../generate/feed/', ',');
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
