import {
	aliasesFilter,
	excludedFilter,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import {
	connectToGoogleSheets,
	getDataFromSheets,
} from '../../../utilities/googleSheets.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { format } from 'date-fns';
import { getDescription } from '../../../utilities/descriptions.js';

const calculatePrice = (price, weight, rate, mu) => {
	let deliveryPrice = 0;
	if (weight <= 10) {
		deliveryPrice = 10 * rate;
	} else if (weight > 10 && weight <= 15) {
		deliveryPrice = 15 * rate;
	} else {
		deliveryPrice = 99999999 * rate;
	}
	return ((price * (mu / 100 + 1) + deliveryPrice) / rate).toFixed(2);
};
const rozetkaFeed = async (
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
	const manualDescriptions = await connectToGoogleSheets(
		'1gZOIB2o8RRah4R3xrX_6t1DupbqUF1VQefnQ5CNfGWM'
	).then((document) =>
		getDataFromSheets(document, 'ROZETKA').then((data) => data)
	);

	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const {
				active,
				variantId,
				activeVariant,
				sku,
				ean,
				weight,
				stock,
				producer,
				sellPrice,
				images,
				category,
				url,
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
			if (stock < minStock) return;

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

			const priceInEur = parseFloat(
				calculatePrice(sellPrice[language].price, weight, 43.41, mu)
			);
			const manualDescriptionIndex = manualDescriptions.findIndex(
				(desc) => parseInt(desc.variantId) === parseInt(variantId)
			);
			if (manualDescriptionIndex === -1) return;
			if (manualDescriptions[manualDescriptionIndex].title_ua === '')
				return;
			if (category[language].length === 0) return;
			if (priceInEur > 150) return;
			return {
				variantId,
				sku,
				ean,
				stock,
				weight,
				title: manualDescriptions[manualDescriptionIndex].title_ua,
				description:
					manualDescriptions[manualDescriptionIndex].description_ua,
				producer,
				category:
					category[language][0].length === undefined
						? [category[language][0]]
						: category[language][0],
				images: imagesUrl(images, language, aliases).filter(
					(img, index, array) =>
						index < 13 || index === array.length - 1
				),
				price: sellPrice[language].price,
				url: productUrl(url, language, aliases),
				attributes: filteredAttributes,
			};
		})
		.filter(Boolean);
	const categories = products
		.map((cat) => cat.category)
		.flat()
		.reduce((previousValue, currentValue) => {
			const index = previousValue.findIndex(
				(prev) =>
					prev.id === currentValue.id &&
					prev.parentId === currentValue.parentId
			);

			if (index === -1) return [...previousValue, currentValue];

			return previousValue;
		}, []);
	categories.push({ id: 1, name: 'Podlasiak' });
	categories.sort((a, b) => a.id - b.id);

	return {
		products: {
			products,
			categories,
		},
		language,
	};
};
const rozetkaXmlSchema = (data, root) => {
	const { products, categories } = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('yml_catalog', {
			date: format(Date.now(), 'yyyy-MM-dd HH:mm'),
		})
		.dtd({ pubID: '', sysID: 'shops.dtd' })
		.ele('shop')
		.ele('name')
		.txt('Rea')
		.up()
		.ele('company')
		.txt('Podlasiak Andrzej Cylwik Spółka Komandytowa')
		.up()
		.ele('url')
		.txt('https://rea.ua/')
		.up()
		.ele('currencies')
		.ele('currency', {
			id: 'UAH',
			rate: '1',
		})
		.up()
		.up();

	const categoryElement = rootElement.ele('categories');

	categories.forEach((category) => {
		if (category.parentId !== undefined) {
			categoryElement
				.ele('category', {
					id: category.id,
					parentId: category.parentId,
				})
				.txt(category.name)
				.up();
		} else {
			categoryElement
				.ele('category', { id: category.id })
				.txt(category.name)
				.up();
		}
	});

	categoryElement.up().up();

	const offers = rootElement.ele('offers');

	products.forEach((product) => {
		const offer = offers
			.ele('offer', {
				id: product.variantId,
				available: product.stock > 5,
			})
			.ele('url')
			.txt(product.url)
			.up()
			.ele('price')
			.txt(product.price)
			.up()
			.ele('currencyId')
			.txt('UAH')
			.up()
			.ele('categoryId')
			.txt(product.category[product.category.length - 1].id)
			.up();

		product.images.forEach((med) => offer.ele('picture').txt(med).up());

		offer
			.ele('vendor')
			.txt(product.producer)
			.up()
			.ele('stock_quantity')
			.txt(product.stock)
			.up()
			.ele('name')
			.txt(product.title)
			.up()
			.ele('description')
			.dat(product.description)
			.up();
		product.attributes.forEach((attribute) => {
			if (attribute.name === '*Wysyłamy w: 24h*') return;
			offer
				.ele('param', { name: attribute.name })
				.txt(attribute.value)
				.up();
		});
	});
	return rootElement;
};

const rozetkaGoogleSheets = (data, aliases) => {
	return new Promise(async (resolve) => {
		await connectToGoogleSheets(
			'1gZOIB2o8RRah4R3xrX_6t1DupbqUF1VQefnQ5CNfGWM'
		).then(async (document) => {
			const sheet = await document.sheetsByTitle['ROZETKA'];
			const rows = await sheet.getRows();
			const sheetData = rows.map((row) => {
				return row.toObject();
			});

			const products = excludedFilter(
				aliasesFilter(data, aliases),
				data.options
			)
				.map((product) => {
					const {
						id,
						active,
						variantId,
						activeVariant,
						sku,
						producer,
						title,
						description,
						weight,
						sellPrice,
						stock,
					} = product;
					if (sku === '') return;
					if (variantId === '') return;
					if (!activeVariant) return;
					if (!active) return;

					const existing = sheetData.filter(
						(item) => item.sku === sku
					);
					const priceInEur = parseFloat(
						calculatePrice(sellPrice.uk.price, weight, 43.41, 0)
					);
					if (existing.length === 0)
						return {
							id,
							variantId,
							sku,
							producer,
							priceInEur,
							stock,
							weight,
							title_pl: title.pl,
							title_ua: '',
							description_pl: getDescription(
								description,
								'pl',
								producer
							),
							description_ua: '',
						};

					if (existing[0].title_ua !== '')
						return {
							id,
							variantId,
							sku,
							producer,
							priceInEur,
							stock,
							weight,
							title_pl: title.pl,
							title_ua: existing[0].title_ua,
							description_pl: getDescription(
								description,
								'pl',
								producer
							),
							description_ua: existing[0].description_ua,
						};
					return {
						id,
						variantId,
						sku,
						producer,
						priceInEur,
						stock,
						weight,
						title_pl: title.pl,
						title_ua: '',
						description_pl: getDescription(
							description,
							'pl',
							producer
						),
						description_ua: '',
					};
				})
				.filter(Boolean)
				.sort((a, b) => {
					if (a.title_ua === '') return 1;
					return -1;
				});

			const headers = Object.keys(products[0]);
			await sheet.setHeaderRow([...headers]);
			await sheet.clearRows();
			await sheet.addRows(products);
		});
		resolve();
	});
};

export const generateRozetkaFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await rozetkaFeed(products, language, config).then(async (data) => {
				await xmlBuilider(data, rozetkaXmlSchema).then(
					async (xml) =>
						await saveFeedFileToDisk(
							xml,
							'rozetka',
							'xml',
							'../generate/feed/'
						)
				);
			});
		}
		// await rozetkaGoogleSheets(products, config.aliases);
		resolve();
	});
};
