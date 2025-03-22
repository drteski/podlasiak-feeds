import {
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	excludedFilter,
	xmlBuilider,
} from '../../processFeed.js';
import { format, formatISO } from 'date-fns';
import { imagesUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';
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
				weight,
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
			if (weight >= 30) return;
			if (!active) return;
			if (!activeVariants) return;

			const storeUrl = getStoreUrl(language, 'Rea');
			const categoryPath =
				category[language][0] === undefined
					? ''
					: category[language][category[language].length - 1]
								.length !== undefined
						? category[language][category[language].length - 1]
								.map((cat) => cat.name)
								.join(' > ')
						: category[language][category[language].length - 1]
								.name;
			return {
				id,
				ean,
				sku,
				title: title[language],
				description: getDescription(description, language, producer),
				brand: producer,
				url: storeUrl + url[language]['Rea'],
				stock,
				category: categoryPath,
				images: imagesUrl(images, language, aliases),
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
		.create({ version: '1.0', encoding: 'UTF-8' })
		.ele('feed', {
			'xmlns:g': 'http://base.google.com/ns/1.0',
			xmlns: 'http://www.w3.org/2005/Atom',
		})
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

	const offers = rootElement;
	products.forEach((product) => {
		const itemFront = offers
			.ele('entry')
			.ele('g:title')
			.dat(`${product.title}`)
			.up()
			.ele('g:link')
			.dat(`${product.url}`)
			.up()
			.ele('g:description')
			.dat(`${product.description}`)
			.up()
			.ele('g:id')
			.txt(`${product.id}`)
			.up()
			.ele('g:condition')
			.dat(`new`)
			.up()
			.ele('g:sale_price')
			.dat(`${product.price} UAH`)
			.up()
			.ele('g:price')
			.dat(`${product.basePrice} UAH`)
			.up()
			.ele('g:availability')
			.dat(`${product.stock > 0 ? 'in stock' : 'out of stock'}`)
			.up()
			.ele('g:product_type')
			.dat(`${product.category}`)
			.up()
			.ele('g:gtin')
			.dat(`${product.ean}`)
			.up()
			.ele('g:mpn')
			.dat(`${product.sku}`)
			.up()
			.ele('g:is_bundle')
			.dat(`no`)
			.up()
			.ele('g:brand')
			.dat(`${product.brand}`)
			.up()
			.ele('g:image_link')
			.dat(`${product.images[0]}`)
			.up()
			.ele('g:additional_image_link')
			.dat(product.images.slice(1, product.images.length - 1).join(','))
			.up()
			.ele('g:shipping')
			.ele('g:country')
			.dat('UA')
			.up()
			.ele('g:service')
			.dat('Meest - Кредитна карта')
			.up()
			.ele('g:price')
			.dat('0 UAH')
			.up()
			.up()
			.ele('g:shipping')
			.ele('g:country')
			.dat('UA')
			.up()
			.ele('g:service')
			.dat('Meest - Наложеним платежем')
			.up()
			.ele('g:price')
			.dat('0 UAH')
			.up()
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
