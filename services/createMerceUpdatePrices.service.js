import csvtojson from 'csvtojson';
import downloadHandler from '../utilities/downloadCsv.utility.js';
import ObjectsToCsv from 'objects-to-csv-file';
import fs from 'fs';
import { format } from 'date-fns';

const pricesUrl =
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7lmkzoao6EluUNJig_HzXCwciFERNvdpuKEothGa-ZhMkDuZKHoQrDMaZ36LOoZMlUVbgXExTJLDI/pub?gid=0&single=true&output=csv';

const config = [
	{
		tariff: 1,
		tax: 23,
		currency: 'PLN',
	},
	{
		tariff: 2,
		tax: 23,
		currency: 'PLN',
	},
	{
		tariff: 5,
		tax: 21,
		currency: 'CZK',
	},
	{
		tariff: 6,
		tax: 21,
		currency: 'CZK',
	},
	{
		tariff: 7,
		tax: 27,
		currency: 'HUF',
	},
	{
		tariff: 8,
		tax: 27,
		currency: 'HUF',
	},
	{
		tariff: 9,
		tax: 20,
		currency: 'GBP',
	},
	{
		tariff: 10,
		tax: 20,
		currency: 'GBP',
	},
	{
		tariff: 11,
		tax: 19,
		currency: 'EUR',
	},
	{
		tariff: 12,
		tax: 19,
		currency: 'EUR',
	},
	{
		tariff: 13,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 14,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 15,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 16,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 17,
		tax: 20,
		currency: 'USD',
	},
	{
		tariff: 18,
		tax: 20,
		currency: 'USD',
	},
	{
		tariff: 19,
		tax: 19,
		currency: 'RON',
	},
	{
		tariff: 20,
		tax: 19,
		currency: 'RON',
	},
	{
		tariff: 21,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 22,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 23,
		tax: 22,
		currency: 'EUR',
	},
	{
		tariff: 24,
		tax: 22,
		currency: 'EUR',
	},
	{
		tariff: 25,
		tax: 20,
		currency: 'BGN',
	},
	{
		tariff: 26,
		tax: 20,
		currency: 'BGN',
	},
	{
		tariff: 27,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 28,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 29,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 30,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 31,
		tax: 25,
		currency: 'EUR',
	},
	{
		tariff: 32,
		tax: 25,
		currency: 'EUR',
	},
	{
		tariff: 33,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 34,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 35,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 36,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 37,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 38,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 39,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 40,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 41,
		tax: 20,
		currency: 'RSD',
	},
	{
		tariff: 42,
		tax: 20,
		currency: 'RSD',
	},
	{
		tariff: 43,
		tax: 23,
		currency: 'EUR',
	},
	{
		tariff: 44,
		tax: 23,
		currency: 'EUR',
	},
	{
		tariff: 45,
		tax: 22,
		currency: 'EUR',
	},
	{
		tariff: 46,
		tax: 22,
		currency: 'EUR',
	},
	{
		tariff: 47,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 48,
		tax: 20,
		currency: 'EUR',
	},
	{
		tariff: 49,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 50,
		tax: 21,
		currency: 'EUR',
	},
	{
		tariff: 51,
		tax: 23,
		currency: 'EUR',
	},
	{
		tariff: 52,
		tax: 23,
		currency: 'EUR',
	},
	{
		tariff: 53,
		tax: 24,
		currency: 'EUR',
	},
	{
		tariff: 54,
		tax: 24,
		currency: 'EUR',
	},
	{
		tariff: 55,
		tax: 24,
		currency: 'EUR',
	},
	{
		tariff: 56,
		tax: 24,
		currency: 'EUR',
	},
];

const getPricesFile = (url) => {
	return new Promise(async (resolve, reject) => {
		const file = await downloadHandler(
			url,
			'../generate/merce/',
			'prices.csv'
		);
		if (file === 'Pobrane') {
			const priceData = await csvtojson()
				.fromFile('../generate/merce/prices.csv')
				.then((json) => {
					return json;
				});
			resolve(priceData);
		} else {
			reject(file);
		}
	});
};

const processPrices = async () => {
	const data = await getPricesFile(pricesUrl).then((res) => res);

	const pricesVariant = [];
	const pricesProduct = [];
	data.forEach((item) => {
		const { id, variantId } = item;
		const priceType = variantId === '' ? 'product' : 'variant';
		for (const [key, value] of Object.entries(item)) {
			if (key.includes('_')) {
				const tariffId = parseInt(key.split('_')[1]);
				const conf = config.filter((item) => item.tariff === tariffId);

				if (priceType === 'product') {
					pricesProduct.push({
						objectId: `${tariffId}_${priceType}_${id}`,
						tariffId,
						// itemType: priceType,
						itemId: id,
						grossPrice: value,
						tax: conf[0].tax,
						currency: conf[0].currency,
					});
				} else {
					pricesVariant.push({
						objectId: `${tariffId}_${priceType}_${variantId}`,
						tariffId,
						// itemType: priceType,
						itemId: variantId,
						grossPrice: value,
						tax: conf[0].tax,
						currency: conf[0].currency,
					});
				}
			}
		}
	});

	const flatten = (arr) =>
		arr.reduce((a, v) => {
			v instanceof Array ? a.push(...flatten(v)) : a.push(v);
			return a;
		}, []);

	const products = flatten(pricesProduct)
		.filter((item) => item.grossPrice !== '')
		.map((prod) => {
			return {
				...prod,
				grossPrice:
					prod.grossPrice === '0'
						? ''
						: prod.grossPrice.replace('.00', ''),
			};
		});
	const variants = flatten(pricesVariant)
		.filter((item) => item.grossPrice !== '')
		.map((prod) => {
			return {
				...prod,
				grossPrice:
					prod.grossPrice === '0'
						? ''
						: prod.grossPrice.replace('.00', ''),
			};
		});
	const product = new ObjectsToCsv(
		flatten(pricesProduct).filter((item) => item.grossPrice !== '')
	);
	const variant = new ObjectsToCsv(
		flatten(pricesVariant).filter((item) => item.grossPrice !== '')
	);

	fs.mkdir(
		`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}`,
		(err) => {
			if (err.code !== 'EEXIST') console.log(err);
		}
	);

	const arrayChunk = 5000;
	const productsChunks = [];
	const variantChunks = [];

	for (let i = 0; i < products.length; i += arrayChunk) {
		const chunks = products.slice(i, i + arrayChunk);
		productsChunks.push(chunks);
	}
	for (let i = 0; i < variants.length; i += arrayChunk) {
		const chunks = variants.slice(i, i + arrayChunk);
		variantChunks.push(chunks);
	}

	const productFiles = productsChunks.map(async (chunk, index) => {
		const productChunk = new ObjectsToCsv(chunk);
		await productChunk.toDisk(
			`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}/${index + 1}_product_${format(new Date(), 'dd-MM-yyyy_HH-mm-ss')}.csv`,
			{
				delimiter: ';',
			}
		);
	});
	const variantFiles = variantChunks.map(async (chunk, index) => {
		const variantChunk = new ObjectsToCsv(chunk);
		await variantChunk.toDisk(
			`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}/${index + 1}_variant_${format(new Date(), 'dd-MM-yyyy_HH-mm-ss')}.csv`,
			{
				delimiter: ';',
			}
		);
	});
	await Promise.all(productFiles);
	await Promise.all(variantFiles);
};

processPrices();
