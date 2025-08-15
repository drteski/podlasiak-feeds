import ObjectsToCsv from 'objects-to-csv-file';
import fs from 'fs';
import { connectToGoogleSheets, getDataFromSheets } from '../utilities/googleSheets.js';
import { tariffConfig } from '../config/config.js';
import { format } from 'date-fns';

const flatten = (arr) =>
	arr.reduce((a, v) => {
		v instanceof Array ? a.push(...flatten(v)) : a.push(v);
		return a;
	}, []);

const chunker = (array, chunkSize) => {
	const dataChunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		const chunks = array.slice(i, i + chunkSize);
		dataChunks.push(chunks);
	}
	return dataChunks;
};

const repairUndefinedData = (data) => {
	return new Promise(async (resolve) => {
		const repairedData = data.map((item) => {
			const newItem = {};

			Object.entries(item).forEach(([key, value]) => {
				return (newItem[key] = value === undefined ? '' : value);
			});

			return newItem;
		});
		resolve(repairedData);
	});
};

const convertToImportData = (data) => {
	return new Promise(async (resolve) => {
		const pricesVariant = [];
		const pricesProduct = [];
		data.forEach((item) => {
			const { id, variantId } = item;
			const priceType = variantId === '' ? 'product' : 'variant';
			for (const [key, value] of Object.entries(item)) {
				if (key.includes('_')) {
					const tariffId = parseInt(key.split('_')[1]);
					const config = tariffConfig.filter((item) => item.tariff === tariffId);

					if (priceType === 'product') {
						pricesProduct.push({ tariffId, itemId: id, grossPrice: value, tax: parseFloat(config[0].tax), currency: config[0].currency });
					} else {
						pricesVariant.push({ tariffId, itemId: variantId, grossPrice: value, tax: parseFloat(config[0].tax), currency: config[0].currency });
					}
				}
			}
		});
		const variant = flatten(pricesVariant)
			.filter((item) => item.grossPrice !== '')
			.map((prod) => {
				return { ...prod, grossPrice: prod.grossPrice === '0' ? '' : parseFloat(prod.grossPrice.replace(',', '.')) };
			});
		const product = flatten(pricesProduct)
			.filter((item) => item.grossPrice !== '')
			.map((prod) => {
				return { ...prod, grossPrice: prod.grossPrice === '0' ? '' : parseFloat(prod.grossPrice.replace(',', '.')) };
			});
		resolve({ variant, product });
	});
};

const splitDataToCountriesAndChunks = (data) => {
	return new Promise((resolve) => {
		const { variant, product } = data;
		const countriesVariant = variant.reduce((previousValue, currentValue) => {
			const tariffIndex = tariffConfig.findIndex((tariff) => tariff.tariff === currentValue.tariffId);
			if (previousValue[tariffConfig[tariffIndex].country]) {
				previousValue[tariffConfig[tariffIndex].country] = [...previousValue[tariffConfig[tariffIndex].country], currentValue];
				return previousValue;
			} else {
				previousValue[tariffConfig[tariffIndex].country] = [currentValue];
				return previousValue;
			}
		}, {});
		const countriesProduct = product.reduce((previousValue, currentValue) => {
			const tariffIndex = tariffConfig.findIndex((tariff) => tariff.tariff === currentValue.tariffId);
			if (previousValue[tariffConfig[tariffIndex].country]) {
				previousValue[tariffConfig[tariffIndex].country] = [...previousValue[tariffConfig[tariffIndex].country], currentValue];
				return previousValue;
			} else {
				previousValue[tariffConfig[tariffIndex].country] = [currentValue];
				return previousValue;
			}
		}, {});
		const splitedVariant = {};
		const splitedProduct = {};

		Object.entries(countriesVariant).forEach(([key, value]) => {
			splitedVariant[key] = chunker(value, 5000);
		});
		Object.entries(countriesProduct).forEach(([key, value]) => {
			splitedProduct[key] = chunker(value, 5000);
		});

		resolve({ splitedVariant, splitedProduct });
	});
};

const saveDataToFiles = (data) => {
	return new Promise((resolve) => {
		console.log(data);
		const { splitedVariant, splitedProduct } = data;
		fs.mkdir(`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}`, (err) => err && resolve(err));
		Object.entries(splitedVariant).forEach(([key, value]) => {
			fs.mkdir(`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}/${key}`, (err) => err && resolve(err));
			value.map(async (chunk, index) => {
				const productChunk = new ObjectsToCsv(chunk);
				await productChunk.toDisk(
					`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}/${key}/${index + 1}_variant_${key.toLowerCase()}_${format(new Date(), 'dd-MM-yyyy_HH-mm-ss')}.csv`,
					{ delimiter: ';' }
				);
			});
		});
		Object.entries(splitedProduct).forEach(([key, value]) => {
			fs.mkdir(`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}/${key}`, (err) => err && resolve(err));
			value.map(async (chunk, index) => {
				const productChunk = new ObjectsToCsv(chunk);
				await productChunk.toDisk(
					`../generate/updatePrices/${format(new Date(), 'dd-MM-yyyy')}/${key}/${index + 1}_product_${key.toLowerCase()}_${format(new Date(), 'dd-MM-yyyy_HH-mm-ss')}.csv`,
					{ delimiter: ';' }
				);
			});
		});

		resolve('Zapisano');
	});
};

await connectToGoogleSheets('1txUfuOznT1I6OdW73UswDTxgOemQ2uMdlIuYjK5dTLI').then((document) =>
	getDataFromSheets(document, 'zmiany cen').then((data) =>
		repairUndefinedData(data).then((data) => convertToImportData(data).then((data) => splitDataToCountriesAndChunks(data).then((data) => saveDataToFiles(data).then((data) => console.log(data)))))
	)
);
