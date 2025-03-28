import { prepareProducts, saveFeedFileToDisk, titleWithVariantName, xmlBuilider } from '../../processFeed.js';
import { getFinalCategory } from '../../../utilities/category.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';

const catalogPatrycjaFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { id, variantName, variantId, title, description, sku, stock, ean, producer, weight, category, attributes, images, basePrice, sellPrice, url } = product;

			const attributeArray = attributes[language].length === undefined ? [attributes[language]] : attributes[language];

			const specification = attributeArray.filter((attribute) => {
				if (attribute.name !== 'Wariant opcji' || attribute.name !== 'Informacja o dostawie') return attribute;
			});

			return {
				id,
				variantId,
				title: titleWithVariantName(title[language], variantName[language]),
				stock,
				weight,
				description: getDescription(description, language, producer),
				specification: [{ name: 'Producent', value: producer }, { name: 'EAN', value: ean }, { name: 'Kod producenta', value: sku }, ...specification],
				url: productUrl(url, language, producer),
				sellPrice: sellPrice[language].price === basePrice[language].price ? '' : sellPrice[language].price,
				basePrice: basePrice[language].price,
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
const catalogPatrycjaXmlSchema = (data, root) => {
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
		});
	products.forEach((product) => {
		const start = rootElement
			.ele('o', {
				id: product.id,
				variantId: product.variantId,
				url: product.url,
				price: product.basePrice,
				promoPrice: product.sellPrice,
				weight: product.weight,
				stock: product.stock,
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
			.ele('imgs');

		const images = () => {
			return product.images.forEach((img, index) => (index === 0 ? start.ele('main', { url: img }).up() : start.ele('i', { url: img }).up()));
		};

		images();
		const end = start.up().ele('attrs');
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

export const generateCatalogPatrycjaFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await catalogPatrycjaFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, catalogPatrycjaXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'catalog_p', 'xml', '../generate/feed/'))
			);
		}
		resolve();
	});
};
