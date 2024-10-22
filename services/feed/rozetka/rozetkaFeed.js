import { format } from 'date-fns';
import {
	aliasesFilter,
	getCurrencyRates,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import axios from 'axios';
import csv from 'csvtojson';
import fs from 'fs';
import FileDownloader from '../../../utilities/downloadCsv.utility.js';

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
	const calculatePrice = (price, weight, rate) => {
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

	await FileDownloader(
		'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNPsD11N9qMUfmG70yyRiWEHE_cEa5_oybRhhaIz_XEHncrN-2GNHTZfrYl9_2v3QmzUWeK0xRTAij/pub?gid=0&single=true&output=csv',
		'../public/rozetka/',
		'descriptions.csv'
	);

	const manualDescriptions = await csv()
		.fromFile('../public/rozetka/descriptions.csv')
		.subscribe((data) => data);

	const eurRate = await getCurrencyRates('EUR').then((data) => data);
	const uahRate = await getCurrencyRates('UAH').then((data) => data);
	const products = aliasesFilter(data, aliases)
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
				title,
				description,
				variantName,
				sellPrice,
				images,
				category,
				url,
				attributes,
			} = product;

			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			if (
				!options.includeVariantIds.some(
					(id) => id === parseInt(variantId)
				)
			)
				return;

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

			const priceInEur = parseFloat(
				calculatePrice(sellPrice[language].price, weight, eurRate)
			);
			const manualDescriptionIndex = manualDescriptions.findIndex(
				(desc) => parseInt(desc.variantId) === parseInt(variantId)
			);
			if (manualDescriptionIndex === -1) return;
			if (category[language].length === 0) return;
			if (priceInEur > 150) return;
			return {
				variantId,
				sku,
				ean,
				stock,
				weight,
				// title: `${producer} ${manualDescriptions[manualDescriptionIndex].title_ua.replace('REA ', '').replace('Rea ', '')} ${variantName[language]}`,
				title: manualDescriptions[manualDescriptionIndex].title_ua,
				description:
					manualDescriptions[manualDescriptionIndex].description_ua,
				producer,
				category:
					category[language][0].length === undefined
						? [category[language][0]]
						: category[language][0],
				images: images
					.map((img) => storeUrl + 'picture/' + img)
					.filter(
						(img, index, array) =>
							index < 13 || index === array.length - 1
					),
				price: calculatePrice(
					sellPrice[language].price,
					weight,
					uahRate
				),
				url: storeUrl + url[language]['Rea'],
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

export const generateRozetkaFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await rozetkaFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, rozetkaXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'rozetka',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
