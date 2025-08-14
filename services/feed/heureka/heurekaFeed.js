import dotenv from 'dotenv';
import { aliasesFilter, saveFeedFileToDisk, xmlBuilider } from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { getFinalCategory } from '../../products/utils/finalCategory.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';
import { replaceEntities } from '../../products/utils/replaceEntities.js';

dotenv.config({ path: '../.env' });

const heurekaFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = aliasesFilter(data, aliases)
		.map((product) => {
			const { active, activeVariant, variantId, title, description, sku, stock, producer, ean, attributes, url, category, images, sellPrice } = product;
			if (variantId === '') return;
			if (activeProducts) {
				if (!active) return;
			}

			if (sku === 'OGR-02112') return;

			if (activeVariants) {
				if (!activeVariant) return;
			}

			if (stock < minStock) return;

			return {
				variantId,
				sku,
				ean: ean === 0 || ean === null ? 0 : ean,
				title: title[language],
				description: replaceEntities(getDescription(description, language, producer)),
				category: getFinalCategory(category[language], true, ' | '),
				url: productUrl(url, language, aliases),
				brand: producer,
				price: addMuToPrice(sellPrice[language].price, mu),
				images: imagesUrl(images, language, aliases),
				attributes: attributes[language].length === undefined ? [attributes[language]] : attributes[language],
			};
		})
		.filter(Boolean);
	return { products, language };
};

const heurekaXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('SHOP');

	products.forEach((product) => {
		const offer = rootElement
			.ele('SHOPITEM')
			.ele('ITEM_ID')
			.txt(product.variantId)
			.up()
			.ele('PRODUCTNAME')
			.txt(product.title)
			.up()
			.ele('PRODUCT')
			.txt(product.title)
			.up()
			.ele('DESCRIPTION')
			.txt(product.description)
			.up()
			.ele('URL')
			.txt(product.url)
			.up()
			.ele('IMGURL')
			.txt(product.images[0])
			.up()
			.ele('IMGURL_ALTERNATIVE')
			.txt(product.images.length > 1 ? product.images[1] : product.images[0])
			.up()
			.ele('PRICE_VAT')
			.txt(product.price)
			.up()
			.ele('MANUFACTURER')
			.txt(product.brand)
			.up()
			.ele('MAINCATEGORY')
			.txt('Vybavení koupelny')
			.up()
			.ele('CATEGORIES')
			.txt(product.category)
			.up()
			.ele('EAN')
			.txt(product.ean)
			.up()
			.ele('PRODUCTNO')
			.txt(product.sku)
			.up()
			.ele('DELIVERY_DATE')
			.txt('2')
			.up()
			.ele('DELIVERY')
			.ele('DELIVERY_ID')
			.txt('DPD')
			.up()
			.ele('DELIVERY_PRICE')
			.txt('0')
			.up()
			.ele('DELIVERY_PRICE_COD')
			.txt('0')
			.up()
			.up();

		product.attributes.forEach((attribute) => {
			offer.ele('PARAM').ele('PARAM_NAME').txt(attribute.name).up().ele('VAL').txt(`${attribute.value}`).up().up();
		});
	});

	return rootElement;
};

export const generateHeurekaFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await heurekaFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, heurekaXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'heureka', config.format, '../generate/feed/'))
			);
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
