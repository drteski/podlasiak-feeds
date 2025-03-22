import {
	aliasesFilter,
	excludedFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import { getSubiektProducts } from '../subiekt/subiektFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

const baselinkerFeed = async (
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
	const subiektData = await getSubiektProducts().then((data) => data);
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const {
				id,
				active,
				variantId,
				activeVariant,
				sku,
				ean,
				stock,
				producer,
				title,
				variantName,
				description,
				sellPrice,
				images,
				weight,
				attributes,
			} = product;
			if (variantId === '') return;
			if (sku === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}

			const titleWithVariantName =
				title[language] +
				' ' +
				variantName[language]
					.replace('Drzwi:', '')
					.replace('Tür: ', '')
					.replace('Duschwand: ', '')
					.replace('Wand:', 'x')
					.replace('0 Tür: ', '0 x ')
					.replace(' Ścianka: ', 'x')
					.replace(' Drzwi: ', 'x')
					.replace(' x Ścianka:', 'x')
					.replace('Drzwi', '')
					.replace(':x', 'x')
					.replace('x1', ' x 1')
					.replace('---', '');

			const filteredAttributes = (
				attributes[language].length === undefined
					? [attributes[language]]
					: attributes[language]
			)
				.map((attribute) => {
					if (attribute.value === '' || attribute.value === undefined)
						return;
					if (attribute.value === 'Wysyłamy w: 24h') return;
					if (attribute.value === '*Wysyłamy w: 24h*') return;
					return attribute;
				})
				.filter(Boolean);

			const storeUrl = getStoreUrl(language, 'Rea');

			const subiektStock = subiektData.filter(
				(subiektProduct) => subiektProduct.sku === sku
			);

			return {
				id,
				variantId,
				title: titleWithVariantName,
				description: getDescription(description, language, producer),
				brand: producer,
				sku,
				ean,
				stock: subiektStock.length !== 0 ? subiektStock[0].Stan : stock,
				weight,
				images: imagesUrl(images, language, aliases),
				attributes: filteredAttributes,
				price: sellPrice[language].price,
			};
		})
		.filter(Boolean);

	return {
		products,
		language,
	};
};
const baselinkerXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root.create({
		version: '1.0',
		encoding: 'UTF-8',
	});

	const offers = rootElement.ele('products');

	products.forEach((product) => {
		const itemFront = offers
			.ele('product')
			.ele('product_id')
			.txt(`${product.id}${product.variantId}`)
			.up()
			.ele('name')
			.txt(`${product.title}`)
			.up()
			.ele('quantity')
			.txt(`${product.stock}`)
			.up()
			.ele('ean')
			.txt(`${product.ean}`)
			.up()
			.ele('sku')
			.txt(`${product.sku}`)
			.up()
			.ele('manufacturer_name')
			.txt(`${product.brand}`)
			.up()
			.ele('price')
			.txt(`${product.price}`)
			.up()
			.ele('tax_rate')
			.txt(`23`)
			.up()
			.ele('weight')
			.txt(`${product.weight}`)
			.up()
			.ele('description')
			.dat(`${product.description}`)
			.up()
			.ele('image')
			.txt(`${product.images[0]}`)
			.up();

		const itemImages = () => {
			return product.images.forEach((image, index) => {
				if (index === 0) return;
				return itemFront
					.ele(`image_extra_${index}`)
					.txt(`${image}`)
					.up();
			});
		};
		itemImages();

		const itemEnd = itemFront.ele('attributes');
		const itemAttributes = () => {
			return product.attributes.forEach((attr) => {
				return itemEnd
					.ele('attribute')
					.ele('attribute_name')
					.txt(`${attr.name}`)
					.up()
					.ele('attribute_value')
					.txt(`${attr.value}`)
					.up()
					.up();
			});
		};
		itemAttributes();
	});
	return rootElement;
};

export const generateBaselinkerFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await baselinkerFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, baselinkerXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'baselinker',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
