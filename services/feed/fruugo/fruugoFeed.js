import {
	aliasesFilter,
	excludedFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const fruugoFeed = async (
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
				async (data) =>
					await xmlBuilider(data, fruugoXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'fruugo',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
