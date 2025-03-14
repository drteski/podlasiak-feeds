import {
	aliasesFilter,
	getStoreUrl,
	excludedFilter,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { imagesUrl } from '../../../utilities/urls.js';

const bazzarFeed = async (
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
				weight,
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

			if (ean === '' || !ean) return;

			const specification = attributes[language]
				.map((attr) => `${attr.name}: ${attr.value}`)
				.join(' ');

			const calculatePrices = () => {
				if (producer === 'Rea')
					return `${Math.ceil(sellPrice[language].price / 1.25 / 1.25)}.00`;
				if (
					producer === 'Tutumi' ||
					producer === 'FlexiFit' ||
					producer === 'Bluegarden' ||
					producer === 'PuppyJoy' ||
					producer === 'Kigu' ||
					producer === 'Fluffy Glow'
				)
					return `${Math.ceil(sellPrice['pl'].price / 1.23 / 4.34)}.00`;
				if (producer === 'Toolight' || producer === 'Spectrum LED')
					return `${Math.ceil(sellPrice[language].price / 1.25 / 1.25)}.00`;
			};
			const categoryPath =
				category[language][0] === undefined
					? ''
					: category[language][category[language].length - 1]
								.length !== undefined
						? category[language][category[language].length - 1]
								.map((cat) => cat.name)
								.join(', ')
						: category[language][category[language].length - 1]
								.name;

			if (categoryPath === '') return;
			return {
				title: title[language],
				brand: producer,
				stock,
				sku,
				ean,
				weight,
				description: getDescription(description, language, producer),
				specification,
				price_mpc: calculatePrices(),
				price_mpc_discount: calculatePrices(),
				price_vpc: calculatePrices(),
				images: imagesUrl(images, language, aliases),
				category: categoryPath,
			};
		})
		.filter(Boolean);
	return {
		products,
		language,
	};
};
const bazzarXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('products');
	products.forEach((product) => {
		const itemFront = rootElement
			.ele('product')
			.ele('id')
			.txt(`${product.sku}`)
			.up()
			.ele('title')
			.txt(`${product.title}`)
			.up()
			.ele('brand')
			.txt(`${product.brand}`)
			.up()
			.ele('stock')
			.txt(`${product.stock}`)
			.up()
			.ele('ean')
			.txt(`${product.ean}`)
			.up()
			.ele('weight')
			.txt(`${product.weight}`)
			.up()
			.ele('description')
			.txt(`${product.description}`)
			.up()
			.ele('price_mpc')
			.txt(`${product.price_mpc}`)
			.up()
			.ele('price_mpc_discount')
			.txt(`${product.price_mpc_discount}`)
			.up()
			.ele('price_vpc')
			.txt(`${product.price_vpc}`)
			.up()
			.ele('category')
			.txt(`${product.category}`)
			.up()
			.ele('images');

		const itemMiddle = () => {
			return product.images.forEach((img) => {
				return itemFront.ele('image').txt(`${img}`).up();
			});
		};

		itemMiddle();
	});
	return rootElement;
};

export const generateBazzarFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await bazzarFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, bazzarXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'bazzar',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
