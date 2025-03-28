import { prepareProducts, saveFeedFileToDisk, titleWithVariantName, xmlBuilider } from '../../processFeed.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const fruugoFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { title, description, sku, stock, ean, variantName, producer, weight, category, attributes, images } = product;

			const specification = attributes[language].map((attr) => `${attr.name}: ${attr.value}`).join(' ');

			const categoryPath =
				category[language][0] === undefined
					? ''
					: category[language][category[language].length - 1].length !== undefined
						? category[language][category[language].length - 1].map((cat) => cat.name).join(', ')
						: category[language][category[language].length - 1].name;

			if (categoryPath === '') return;
			return {
				title: titleWithVariantName(title[language], variantName[language]),
				brand: producer,
				stock,
				sku,
				ean,
				weight,
				description: getDescription(description, language, producer),
				specification,
				images: imagesUrl(images, language, producer),
				category: categoryPath,
			};
		})
		.filter(Boolean);
	return {
		products,
		language,
	};
};
const fruugoXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('Products');
	products.forEach((product) => {
		const itemFront = rootElement
			.ele('Product')
			.ele('ProductId')
			.txt(`${product.ProductId}`)
			.up()
			.ele('SkuId')
			.txt(`${product.SkuId}`)
			.up()
			.ele('EAN')
			.txt(`${product.EAN}`)
			.up()
			.ele('Brand')
			.txt(`${product.Brand}`)
			.up()
			.ele('Category')
			.txt(`${product.Category}`)
			.up();

		const mapImages = () => {
			return product.images.forEach((media, index) => {
				return itemFront
					.ele(`Imageurl${index + 1}`)
					.txt(`${media}`)
					.up();
			});
		};

		const itemMiddle = mapImages();
		itemMiddle
			.ele('StockStatus')
			.txt(`${product.StockStatus}`)
			.up()
			.ele('StockQuantity')
			.txt(`${product.StockQuantity}`)
			.up()
			.ele('PackageWeight')
			.txt(`${product.PackageWeight}`)
			.up()
			.ele('Description')
			.ele('Language')
			.txt(`${product.Language}`)
			.up()
			.ele('Title')
			.txt(`${product.Title}`)
			.up()
			.ele('Description')
			.txt(`${product.Description}`)
			.up()
			.up()
			.ele('Price')
			.ele('NormalPriceWithoutVAT')
			.txt(`${product.NormalPriceWithoutVAT}`)
			.up()
			.ele('VATRate')
			.txt(`${product.VATRate}`)
			.up()
			.ele('Attribute1')
			.txt(``)
			.up()
			.ele('Attribute2')
			.txt(``)
			.up()
			.ele('Attribute3')
			.txt(``)
			.up()
			.ele('Attribute4')
			.txt(``)
			.up()
			.ele('Attribute5')
			.txt(``)
			.up()
			.ele('Attribute6')
			.txt(``)
			.up()
			.ele('Attribute7')
			.txt(``)
			.up()
			.ele('Attribute8')
			.txt(``)
			.up()
			.up();
	});
	return rootElement;
};

export const generateFruugoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await fruugoFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, fruugoXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'fruugo', 'xml', '../generate/feed/'))
			);
		}
		resolve();
	});
};
