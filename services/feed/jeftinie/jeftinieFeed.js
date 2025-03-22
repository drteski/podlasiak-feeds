import {
	aliasesFilter,
	excludedFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const jeftinieFeed = async (
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
				title,
				description,
				sku,
				stock,
				ean,
				producer,
				url,
				category,
				attributes,
				images,
				sellPrice,
			} = product;

			if (producer === '') return;
			if (variantId === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			const specification = attributes[language]
				.map(
					(attribute) =>
						`<li>${attribute.name}: ${attribute.value}</li>`
				)
				.join('');

			const categoryPath =
				category[language][0] === undefined
					? ''
					: category[language][category[language].length - 1]
								.length !== undefined
						? category[language][category[language].length - 1].map(
								(cat) => cat.name
							)
						: category[language][category[language].length - 1];
			return {
				id: variantId,
				name: title[language],
				description: getDescription(description, language, producer),
				link: productUrl(url, language, aliases),
				producer,
				quantity: stock,
				fileUnder: categoryPath[categoryPath.length - 1],
				stock: stock > 0 ? 'in stock' : 'out of stock',
				ean: !ean ? '' : ean,
				price: sellPrice[language].price,
				images: imagesUrl(images, language, aliases),
				productCode: sku,
				specification,
				attributes: attributes[language].map((attribute) => ({
					name: attribute.name,
					value: attribute.value,
				})),
			};
		})
		.filter(Boolean);
	return {
		products,
		language,
	};
};
const jeftinieXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({ version: '1.0', encoding: 'UTF-8' })
		.ele('CNJExport');

	products.forEach((product) => {
		const itemFront = rootElement
			.ele('Item')
			.ele('ID')
			.dat(`${product.id}`)
			.up()
			.ele('name')
			.dat(`${product.name}`)
			.up()
			.ele('description')
			.dat(`${product.description}`)
			.up()
			.ele('specifications')
			.dat(`${product.specification}`)
			.up()
			.ele('link')
			.dat(`${product.link}`)
			.up()
			.ele('mainImage')
			.dat(`${product.images[0]}`)
			.up()
			.ele('moreImages')
			.dat(`${product.images.join(',')}`)
			.up()
			.ele('price')
			.txt(`${product.price}`)
			.up()
			.ele('stock')
			.txt(`${product.stock}`)
			.up()
			.ele('inStoreAvailability')
			.ele('store')
			.dat(
				'Podlasiak Andrzej Cylwik Sp.K., Przędzalniana 6L, Białystok 15-688, Polska'
			)
			.up()
			.ele('availability')
			.txt('today')
			.up()
			.ele('quantity')
			.txt(`${product.quantity}`)
			.up()
			.up()
			.ele('fileUnder')
			.dat(`${product.fileUnder}`)
			.up()
			.ele('brand')
			.dat(`${product.producer}`)
			.up()
			.ele('EAN')
			.dat(`${product.ean}`)
			.up()
			.ele('productCode')
			.dat(`${product.productCode}`)
			.up()
			.ele('contition')
			.dat(`new`)
			.up()
			.ele('warranty')
			.dat('2 years')
			.up()
			.ele('deliveryCost')
			.txt('0')
			.up()
			.ele('attributes');

		const attributeTags = () => {
			return product.attributes.forEach((attribute) =>
				itemFront
					.ele('atribute')
					.ele('name')
					.dat(`${attribute.name}`)
					.up()
					.ele('values')
					.ele('value')
					.dat(`${attribute.value}`)
					.up()
					.up()
			);
		};

		attributeTags();
	});
	return rootElement;
};

export const generateJeftinieFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await jeftinieFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, jeftinieXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'jeftinie',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
