import { prepareProducts, saveFeedFileToDisk, titleWithVariantName, xmlBuilider } from '../../processFeed.js';
import { getFinalCategory } from '../../../utilities/category.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const ceneoFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { variantName, variantId, title, description, sku, stock, ean, producer, weight, category, attributes, images, sellPrice, url } = product;

			const attributeArray = attributes[language].length === undefined ? [attributes[language]] : attributes[language];

			const specification = attributeArray.filter((attribute) => {
				if (attribute.name !== 'Wariant opcji' || attribute.name !== 'Informacja o dostawie') return attribute;
			});

			return {
				variantId,
				title: titleWithVariantName(title[language], variantName[language]),
				stock,
				weight,
				description: getDescription(description, language, producer),
				specification: [{ name: 'Producent', value: producer }, { name: 'EAN', value: ean }, { name: 'Kod producenta', value: sku }, ...specification],
				url: productUrl(url, language, producer),
				price: sellPrice[language].price,
				images: imagesUrl(images, language, producer),
				category: getFinalCategory(category[language], true),
			};
		})
		.filter(Boolean);
	return {
		products,
		language,
	};
};
const ceneoXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('offers', {
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			version: '1',
			name: 'other',
		})
		.ele('responsibleProducers')
		.ele('p', { id: 'Rea' })
		.ele('name')
		.txt('Podlasiak Andrzej Cylwik Spółka Komandytowa')
		.up()
		.ele('address')
		.ele('countryCode')
		.txt('PL')
		.up()
		.ele('street')
		.txt('Przędzalniana 60')
		.up()
		.ele('postalCode')
		.txt('15-688')
		.up()
		.ele('city')
		.txt('Białystok')
		.up()
		.up()
		.ele('contact')
		.ele('email')
		.txt('biuro.rea@podlasiak.com.pl')
		.up()
		.ele('phoneNumber')
		.txt('+48857337777')
		.up()
		.up()
		.up()
		.up();
	products.forEach((product) => {
		const start = rootElement
			.ele('o', {
				id: product.variantId,
				url: product.url,
				price: product.price,
				avail: product.stock > 0 ? '1' : '99',
				weight: product.weight,
				stock: product.stock,
				basket: product.stock > 0 ? '1' : '0',
				set: 0,
			})
			.ele('cat')
			.txt(`${product.category}`)
			.up()
			.ele('name')
			.txt(`${product.title}`)
			.up()
			.ele('desc')
			.dat(`${product.description}`)
			.up()
			.ele('images');

		const images = () => {
			return product.images.forEach((img, index) => (index === 0 ? start.ele('main', { url: img }).up() : start.ele('i', { url: img }).up()));
		};

		images();
		const end = start.up().ele('attrs').ele('a', { name: 'Producent odpowiedzialny' }).dat('Rea').up();
		const attributes = () => {
			return product.specification.forEach((attribute) => {
				if (attribute.value === undefined || attribute.value === '') return;
				return end.ele('a', { name: attribute.name }).dat(attribute.value).up().up();
			});
		};
		attributes();
	});
	return rootElement;
};

export const generateCeneoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await ceneoFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, ceneoXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'ceneo', 'xml', '../generate/feed/'))
			);
		}
		resolve();
	});
};
