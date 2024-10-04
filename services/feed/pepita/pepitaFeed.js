import dotenv from 'dotenv';
import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';

dotenv.config({ path: '../.env' });

const pepitaFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
	}
) => {
	const products = aliasesFilter(data, aliases)
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
				attributes,
				url,
				category,
				images,
				sellPrice,
			} = product;

			if (activeProducts) {
				if (!active) return;
			}

			if (activeVariants) {
				if (!activeVariant) return;
			}

			if (stock < minStock) return;

			const storeUrl = getStoreUrl(language, 'Rea');
			if (ean === '' || !ean) return;

			return {
				variantId,
				sku,
				ean,
				title: title[language],
				description: description[language],
				price: addMuToPrice(sellPrice[language].price, mu),
				currency: sellPrice[language].currency,
				category:
					category[language][category[language].length - 1].length ===
					undefined
						? category[language][category[language].length - 1].name
						: category[language][category[language].length - 1][
								category[language][
									category[language].length - 1
								].length - 1
							].name,
				images: images.map((img, index) => ({
					url: storeUrl + 'picture/' + img,
					main: index === 0,
				})),
				url: storeUrl + url[language]['Rea'],
				stock,
				attributes:
					attributes[language].length === undefined
						? [attributes[language]]
						: attributes[language],
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
			return offer
				.ele('Photo')
				.ele('Url')
				.txt(img.url)
				.up()
				.ele('IsPrimary')
				.txt(img.main)
				.up()
				.up();
		});

		const attributes = offer.up().ele('Attributes');

		product.attributes.forEach((attribute) => {
			if (attribute.name === 'Wariant opcji') return;
			return attributes
				.ele('Attribute')
				.ele('AttributeName')
				.txt(attribute.name)
				.up()
				.ele('AttributeValue')
				.txt(attribute.value)
				.up()
				.up();
		});

		attributes.up();
	});

	return rootElement;
};

export const generatePepitaFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await pepitaFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, pepitaXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'pepita',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
