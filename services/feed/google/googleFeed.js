import {
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import { format, formatISO } from 'date-fns';
const googleFeed = async (
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
	const products = aliasesFilter(data, aliases)
		.map((product) => {
			const {
				id,
				active,
				variantId,
				sku,
				ean,
				stock,
				producer,
				category,
				title,
				description,
				basePrice,
				sellPrice,
				images,
				url,
			} = product;
			if (variantId === '') return;
			if (sku === '') return;

			const storeUrl = getStoreUrl(language, 'Rea');
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
			return {
				id,
				ean,
				sku,
				title: title[language],
				description: description[language],
				brand: producer,
				url: storeUrl + url[language]['Rea'],
				stock,
				category: categoryPath,
				images: images.map((img) => storeUrl + 'picture/' + img),
				price: sellPrice[language].price,
				basePrice: basePrice[language].price,
			};
		})
		.filter(Boolean);
	return {
		products,
		language,
	};
};
const googleXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({ version: '1.0' })
		.ele('rss', {
			'xmlns:g': 'http://base.google.com/ns/1.0',
			version: '2.0',
		})
		.ele('channel')
		.ele('title')
		.dat('rea.ua')
		.up()
		.ele('link', {
			href: 'https://rea.ua',
			rel: 'alternate',
			type: 'text/html',
		})
		.up()
		.ele('updated')
		.dat(formatISO(Date.now()))
		.up();

	const offers = rootElement.ele('items');
	products.forEach((product) => {
		const itemFront = offers
			.ele('item')
			.ele('g:title')
			.dat(`${product.title}`)
			.up()
			.ele('g:link')
			.txt(`${product.url}`)
			.up()
			.ele('g:description')
			.txt(`${product.description}`)
			.up()
			.ele('g:id')
			.txt(`${product.id}`)
			.up()
			.ele('g:condition')
			.txt(`new`)
			.up()
			.ele('g:sale_price')
			.txt(`${product.price}`)
			.up()
			.ele('g:price')
			.txt(`${product.basePrice}`)
			.up()
			.ele('g:availability')
			.txt(`${product.stock > 0 ? 'in stock' : 'out of stock'}`)
			.up()
			.ele('g:product_type')
			.txt(`${product.category}`)
			.up()
			.ele('g:gtin')
			.txt(`${product.ean}`)
			.up()
			.ele('g:mpn')
			.txt(`${product.sku}`)
			.up()
			.ele('g:is_bundle')
			.txt(`no`)
			.up()
			.ele('g:brand')
			.txt(`${product.brand}`)
			.up()
			.ele('g:image_link')
			.txt(`${product.images[0]}`)
			.up()
			.ele('g:additional_image_link')
			.txt(product.images.slice(1, product.images.length - 1).join(','))
			.up();
	});
	return rootElement;
};

export const generateGoogleFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await googleFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, googleXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'google',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
