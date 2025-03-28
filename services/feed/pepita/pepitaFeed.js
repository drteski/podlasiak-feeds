import dotenv from 'dotenv';
import { prepareProducts, replaceEntities, saveFeedFileToDisk, xmlBuilider } from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

dotenv.config({ path: '../.env' });

const pepitaFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { variantId, title, description, sku, stock, producer, ean, attributes, url, category, images, sellPrice } = product;

			return {
				variantId,
				sku,
				ean,
				title: title[language],
				description: replaceEntities(getDescription(description, language, producer)),
				price: sellPrice[language].price,
				currency: sellPrice[language].currency,
				category:
					category[language][category[language].length - 1].length === undefined
						? category[language][category[language].length - 1].name
						: category[language][category[language].length - 1][category[language][category[language].length - 1].length - 1].name,
				images: imagesUrl(images, language, producer).map((img, index) => ({
					url: img,
					main: index === 0,
				})),
				url: productUrl(url, language, producer),
				stock,
				attributes: attributes[language].length === undefined ? [attributes[language]] : attributes[language],
			};
		})
		.filter(Boolean);
	return { products, language };
};

const pepitaXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('Catalog', { xmlns: 'https://pepita.hu/feed/1.0' });

	products.forEach((product) => {
		const offer = rootElement
			.ele('Product')
			.ele('Id')
			.txt(`${product.variantId}`)
			.up()
			.ele('StructuredId')
			.txt(`${product.ean}`)
			.up()
			.ele('ProductNumber')
			.txt(`${product.sku}`)
			.up()
			.ele('Descriptions')
			.ele('Name')
			.txt(`${product.title}`)
			.up()
			.ele('Description')
			.txt(`${product.description}`)
			.up()
			.up()
			.ele('Prices')
			.ele('Currency')
			.txt(`${product.currency}`)
			.up()
			.ele('Price')
			.txt(`${product.price}`)
			.up()
			.up()
			.ele('Categories')
			.ele('Category')
			.ele('Name')
			.txt(`${product.category}`)
			.up()
			.up()
			.up()
			.ele('ProductUrl')
			.txt(`${product.url}`)
			.up()
			.ele('Availability')
			.ele('Available')
			.txt(`${product.stock > 0}`)
			.up()
			.ele('Quantity')
			.txt(`${product.stock}`)
			.up()
			.up()
			.ele('Photos');

		product.images.forEach((img) => {
			return offer.ele('Photo').ele('Url').txt(img.url).up().ele('IsPrimary').txt(img.main).up().up();
		});

		const attributes = offer.up().ele('Attributes');

		product.attributes.forEach((attribute) => {
			if (attribute.name === 'Wariant opcji') return;
			return attributes.ele('Attribute').ele('AttributeName').txt(attribute.name).up().ele('AttributeValue').txt(attribute.value).up().up();
		});

		attributes.up();
	});

	return rootElement;
};

export const generatePepitaFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await pepitaFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, pepitaXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'pepita', 'xml', '../generate/feed/'))
			);
		}
		resolve();
	});
};
