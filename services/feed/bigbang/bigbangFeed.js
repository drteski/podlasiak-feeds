import dotenv from 'dotenv';
import { aliasesFilter, excludedFilter, saveFeedFileToDisk, xmlBuilider } from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';
import { descriptionSplitter, getDescription } from '../../../utilities/descriptions.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { getFinalCategory } from '../../products/utils/finalCategory.js';
import { replaceEntities } from '../../products/utils/replaceEntities.js';

dotenv.config({ path: '../.env' });

const bigBangFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, activeVariant, variantId, title, description, sku, stock, producer, ean, attributes, url, category, images, sellPrice, weight } = product;
			if (variantId === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;
			if (ean === '' || !ean) return;

			const specification =
				attributes[language].length === undefined
					? [attributes[language]].map((attr) => `${attr.name}: ${attr.value}`).join(' ')
					: attributes[language].map((attr) => `${attr.name}: ${attr.value}`).join(' ');
			const shortDesc = descriptionSplitter(replaceEntities(getDescription(description, language, producer)));

			return {
				variantId,
				title: title[language],
				brand: producer,
				url: productUrl(url, language, aliases),
				stock,
				sku,
				ean,
				weight,
				description: replaceEntities(getDescription(description, language, producer)),
				shortDesc,
				specification,
				price: addMuToPrice(sellPrice[language].price, mu),
				images: imagesUrl(images, language, aliases),
				category: getFinalCategory(category[language], false),
			};
		})
		.filter(Boolean);
	return { products, language };
};

const bigBangXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('import');

	const firstPart = () => {
		const first = rootElement.ele('products');
		products.forEach((product) => {
			const subFirst = first
				.ele('product')
				.ele('productCategory')
				.txt(product.category)
				.up()
				.ele('sku')
				.txt(product.sku)
				.up()
				.ele('ean')
				.txt(product.ean)
				.up()
				.ele('brand')
				.txt(product.brand)
				.up()
				.ele('productTitle_sl')
				.txt(product.title)
				.up()
				.ele('mainImage')
				.txt(product.images[0])
				.up();
			product.images.forEach((med, index) => {
				if (index === 0) return;
				subFirst.ele(`Image${index}`).txt(med).up();
			});

			subFirst.ele('description_sl').txt(product.description).up().ele('shortDescription_sl').txt(product.shortDesc[0]).up();
		});
	};

	const secondPart = () => {
		const second = rootElement.ele('offers');
		products.forEach((product) => {
			second
				.ele('offer')
				.ele('sku')
				.txt(product.sku)
				.up()
				.ele('product-id')
				.txt(product.ean)
				.up()
				.ele('product-id-type')
				.txt('EAN')
				.up()
				.ele('price')
				.txt(product.price)
				.up()
				.ele('quantity')
				.txt(product.stock)
				.up()
				.ele('state')
				.txt('1')
				.up();
		});
	};
	firstPart();
	secondPart();

	return rootElement;
};

export const generateBigBangFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await bigBangFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, bigBangXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'bigbang', 'xml', '../generate/feed/'))
			);
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
