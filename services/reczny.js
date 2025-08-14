import { connectToGoogleSheets, getDataFromSheets } from '../utilities/googleSheets.js';
import { tariffConfig } from '../config/config.js';
import dotenv, { config } from 'dotenv';
import mongoose, { connect } from 'mongoose';
import { runFeedGenerator } from './products/services/runFeedGenerator.js';
import { numberToLetters } from './products/utils/numbersToLetters.js';
import axios from 'axios';
import { chunker } from './products/utils/chunker.js';

dotenv.config({ path: '../.env' });
const { DATABASE_URL } = process.env;

mongoose.set('strictQuery', true);
await mongoose.connect(
	DATABASE_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 10000,
	},
	(error) => {
		if (error) {
			console.log(error);
		}
	}
);

mongoose.connection.on('connection', () => console.log('Połączono z DB'));
mongoose.connection.on('error', (err) => console.log(err));

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

const groupProducts = (items) => {
	const variantsMap = {};
	const result = [];
	for (const item of items) {
		if (item.count === 1) {
			result.push(item);
		} else {
			if (!variantsMap[item.id]) {
				variantsMap[item.id] = [];
			}
			variantsMap[item.id].push(item);
		}
	}
	for (const [id, variants] of Object.entries(variantsMap)) {
		result.push({
			id: Number(id),
			variants,
			count: variants.length,
		});
	}
	return result;
};

const categories = await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then((document) =>
	getDataFromSheets(document, 'MAPOWANIE').then((data) =>
		data.map((item) => ({
			uid: parseInt(item.uid),
			category: item.category,
		}))
	)
);

const muTable = await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then((document) => getDataFromSheets(document, 'MU').then((data) => data));

const cargoTable = await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then((document) => getDataFromSheets(document, 'TRANSPORTY').then((data) => data));

const currencyTable = await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then((document) => getDataFromSheets(document, 'KURSY').then((data) => data));

const factorTable = await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then((document) => getDataFromSheets(document, 'ZAOKRĄGLENIE').then((data) => data));
const pushNBPCurrencies = async () => {
	const nbp = await axios
		.get('https://api.nbp.pl/api/exchangerates/tables/a', { responseType: 'json' })
		.then((res) => [
			{ currency: 'polski złoty', code: 'PLN', mid: 1 },
			...res.data[0].rates.filter(
				(rate) =>
					rate.code === 'USD' || rate.code === 'EUR' || rate.code === 'GBP' || rate.code === 'HUF' || rate.code === 'RON' || rate.code === 'BGN' || rate.code === 'CZK' || rate.code === 'UAH'
			),
		])
		.then((rates) => {
			(async () => {
				const data = currencyTable.map((item) => {
					Object.keys(item).forEach((key) => {
						if (key === 'category') return;
						const tariffId = parseInt(key.split('_')[1]);
						const currency = tariffConfig.find((tariff) => tariffId === tariff.tariff).currency;
						return (item[key] = rates.find((rate) => rate.code === currency).mid);
					});
					return item;
				});
				await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then(async (document) => {
					const sheet = await document.sheetsByTitle['KURSY'];
					await sheet.setHeaderRow([...Object.keys(data[0])]);
					await sheet.clearRows();
					await sheet.addRows(data);
				});
			})();
		});
};

const pushCategroiesMapping = async (products) => {
	const data = products.map((product) => {
		const { uid, id, variantId, sku, weight, title, variantName } = product;
		const sheetCategory = categories.find((category) => category.uid === uid);
		return {
			uid,
			id,
			variantId,
			sku,
			weight,
			title: title['pl'],
			variantName: variantName['pl'],
			category: sheetCategory?.category === undefined ? '' : sheetCategory.category,
		};
	});
	await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then(async (document) => {
		const sheet = await document.sheetsByTitle['MAPOWANIE'];
		await sheet.setHeaderRow([...Object.keys(data[0])]);
		await sheet.clearRows();
		await sheet.addRows(data);
	});
};
const priceChangeFeed = async (products, { chunks = 1000 }) => {
	await connectToGoogleSheets('1txUfuOznT1I6OdW73UswDTxgOemQ2uMdlIuYjK5dTLI').then(async (document) => {
		const sheet = await document.sheetsByTitle['PRZELICZANIE CEN'];
		await sheet.setHeaderRow([...Object.keys(productsToAdd[0])]);
		await sheet.addRows(productsToAdd);
	});
	// await connectToGoogleSheets('1txUfuOznT1I6OdW73UswDTxgOemQ2uMdlIuYjK5dTLI').then(async (document) => {
	// 	const sheet = await document.sheetsByTitle['PRZELICZANIE CEN'];
	// 	await sheet.clearRows();
	// });
	const { productsChunker } = await import('./processFeed.js');
	const chunkedProducts = productsChunker(
		products.map((product, index) => {
			const { row, id, active, uid, variantId, activeVariant, ean, weight, title, variantName, sku, category, sellPrice, basePrice } = product;
			const sheetCategory = categories.find((category) => category.uid === uid);
			delete product.category;
			return {
				row: index + 2,
				id,
				active,
				variantId,
				activeVariant,
				ean,
				weight,
				title,
				variantName,
				sku,
				sellPrice,
				basePrice,
				category: sheetCategory?.category === undefined ? '' : sheetCategory.category,
			};
		}),
		chunks
	);

	for await (const chunk of chunkedProducts) {
		console.log(chunk.length);
		const productsToAdd = [];
		for (const product of chunk) {
			const { row, id, active, variantId, activeVariant, ean, weight, title, variantName, sku, category, sellPrice, basePrice } = product;
			const prices = tariffConfig.reduce((previousValue, currentValue, column) => {
				let value = '';
				if (currentValue.code === 'pl') {
					if (currentValue.type === 'base') value = basePrice['pl'].price;
					if (currentValue.type === 'promo') value = sellPrice['pl'].price;
				} else if (currentValue.code === 'cz' || currentValue.code === 'sk') {
					if (currentValue.type === 'base')
						value = `=IFNA(
    IF($A${row} = 1;
       IF($E${row} <> "";
          "";
          MROUND(
              (  $M${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
              *(1 + (XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})/100)))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22));
       IF($E${row} <> "";
          MROUND(
              (  $M${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
              *(1 + (XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})/100)))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22);
          MROUND(
              (    MINIFS($M:$M; $C:$C; $C${row}; $E:$E; ">0")
                 / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
              *(1 + (XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})/100)))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22)));
    "BRAK DANYCH")`;
					if (currentValue.type === 'promo')
						value = `=IFNA(
    IF($A${row} = 1;
       IF($E${row} <> "";
          "";
          MROUND(
              (  $L${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
              *(1 + (XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})/100)))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22));
       IF($E${row} <> "";
          MROUND(
              (  $L${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
              *(1 + (XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})/100)))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22);
          MROUND(
              (    MINIFS($L:$L; $C:$C; $C${row}; $E:$E; ">0")
                 / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
              *(1 + (XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})/100)))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22)));
    "BRAK DANYCH")`;
				} else {
					if (currentValue.type === 'base')
						value = `=IFNA(
    IF($A${row} = 1;
       IF($E${row} <> "";
          "";
          MROUND(
              (  $L${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
               + XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)}))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22));
       IF($E${row} <> "";
          MROUND(
              (  $L${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
               + XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)}))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22);
          MROUND(
              (    MINIFS($L:$L; $C:$C; $C${row}; $E:$E; ">0")
                 / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
               + XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)}))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22)));
    "BRAK DANYCH")`;
					if (currentValue.type === 'promo')
						value = `=IFNA(
    IF($A${row} = 1;
       IF($E${row} <> "";
          "";
          MROUND(
              (  $M${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
               + XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)}))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22));
       IF($E${row} <> "";
          MROUND(
              (  $M${row} / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
               + XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)}))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22);
          MROUND(
              (    MINIFS($M:$M; $C:$C; $C${row}; $E:$E; ">0")
                 / ((100 - XLOOKUP($K${row}; MU!$A:$A; MU!${numberToLetters(column + 2)}:${numberToLetters(column + 2)})) / 100)
               + XLOOKUP($K${row}; 'CENY TRANSPORTU'!$A:$A; 'CENY TRANSPORTU'!${numberToLetters(column + 2)}:${numberToLetters(column + 2)}))
            / KURSY!${numberToLetters(column + 2)}$3;
            KURSY!${numberToLetters(column + 2)}$22)));
    "BRAK DANYCH")`;
				}
				return { ...previousValue, [`${currentValue.code.toUpperCase()}_${currentValue.tariff}`]: value };
			}, {});
			productsToAdd.push({
				count: `=COUNTIF(C:C;C${row})-1`,
				active: active ? 1 : 0,
				id,
				variantId,
				activeVariant: activeVariant ? 1 : 0,
				sku,
				ean,
				weight,
				title: title['pl'],
				variantName: variantName['pl'],
				category,
				...prices,
			});
		}

		await connectToGoogleSheets('1txUfuOznT1I6OdW73UswDTxgOemQ2uMdlIuYjK5dTLI').then(async (document) => {
			const sheet = await document.sheetsByTitle['PRZELICZANIE CEN'];
			await sheet.setHeaderRow([...Object.keys(productsToAdd[0])]);
			await sheet.addRows(productsToAdd);
		});
	}
};

const calculatePrice = (price, lang, category) => {
	const getMu = Object.entries(muTable.find((table) => table.category === category)).find(([key]) => key.split('_')[0].toLowerCase() === lang);
	const getCargo = Object.entries(cargoTable.find((table) => table.category === category)).find(([key]) => key.split('_')[0].toLowerCase() === lang);
	const getCurrency = Object.entries(currencyTable.find((table) => table.category === category)).find(([key]) => key.split('_')[0].toLowerCase() === lang);
	const getFactor = Object.entries(factorTable[0]).find(([key]) => key.split('_')[0].toLowerCase() === lang);
	const factor = getFactor[0] !== undefined ? parseInt(getFactor[1]) : null;
	const currency = getCurrency[0] !== undefined ? parseFloat(getCurrency[1].replace(',', '.')) : null;
	const mu = getMu[0] !== undefined ? parseFloat(getMu[1].replace(',', '.')) : null;
	const cargo = getCargo[0] !== undefined ? parseFloat(getCargo[1].replace(',', '.')) : null;

	if (lang === 'cz' || lang === 'sk') return parseFloat((Math.round((((price / (100 - mu)) * (1 + cargo / 100)) / currency).toFixed(2) / factor) * factor).toFixed(2));
	return parseFloat((Math.round(((price / ((100 - mu) / 100) + cargo) / currency).toFixed(2) / factor) * factor).toFixed(2));
};

const getPricesToChange = async (products) => {
	return await connectToGoogleSheets('1RCpgsPbXC90GTcKpb5EoXA8jJZXKs2qreyFyyW-3b2k').then((document) => {
		return (async () => {
			const sheets = await document.sheetsByTitle;
			const documents = Object.keys(sheets)
				.map((key) => {
					const tariff = tariffConfig.find((tariff) => tariff.code === key.toLowerCase());
					if (key === 'WSZYSTKIE' || tariff !== undefined) return key;
				})
				.filter(Boolean);
			const pricesToChange = [];
			for await (const doc of documents) {
				const data = await getDataFromSheets(document, doc).then((data) => data);
				await delay(100);
				if (data.length === 0) continue;
				pricesToChange.push({
					lang: doc,
					data: groupProducts(
						data
							.map((item) => {
								const existingProduct = products.find((product) => product.sku === item.sku);
								if (existingProduct) {
									const category = categories.find((category) => category.uid === existingProduct.uid);
									if (!category) return undefined;
									return {
										sku: item.sku,
										base: item.base ? parseFloat(item.base.replace(',', '.')) : item.base,
										sell: item.promo ? parseFloat(item.promo.replace(',', '.')) : item.promo,
										id: parseInt(existingProduct.id),
										variantId: existingProduct.variantId === '' ? '' : parseInt(existingProduct.variantId),
										category: category.category,
										count: existingProduct.count,
									};
								}
								return undefined;
							})
							.filter(Boolean)
					),
				});
			}
			return pricesToChange;
		})();
	});
};

const preparePrices = (products, prices) => {
	const { lang, data } = prices;
	const productsToChange = [];
	const variantsToChange = [];
	data.forEach((item) => {
		const tariffBase = tariffConfig.find((tariff) => tariff.code === lang.toLowerCase() && tariff.type === 'base');
		const tariffSell = tariffConfig.find((tariff) => tariff.code === lang.toLowerCase() && tariff.type === 'promo');
		if (item.count === 1) {
			const { id, base, sell, category } = item;
			if (base > 0) {
				products
					.filter((product) => parseInt(product.id) === id)
					.forEach((product) => {
						const grossPrice = calculatePrice(base, lang.toLowerCase(), category);
						if (product.variantId === '')
							return productsToChange.push({
								tariffId: tariffBase.tariff,
								itemId: parseInt(product.id),
								grossPrice,
								tax: tariffBase.tax,
								currency: tariffBase.currency,
							});
						return variantsToChange.push({
							tariffId: tariffBase.tariff,
							itemId: parseInt(product.variantId),
							grossPrice: '',
							tax: tariffBase.tax,
							currency: tariffBase.currency,
						});
					});
			}
			if (sell > 0) {
				products
					.filter((product) => parseInt(product.id) === id)
					.forEach((product) => {
						const grossPrice = calculatePrice(sell, lang.toLowerCase(), category);
						if (product.variantId === '')
							return productsToChange.push({
								tariffId: tariffSell.tariff,
								itemId: parseInt(product.id),
								grossPrice,
								tax: tariffSell.tax,
								currency: tariffSell.currency,
							});
						return variantsToChange.push({
							tariffId: tariffSell.tariff,
							itemId: parseInt(product.variantId),
							grossPrice: '',
							tax: tariffSell.tax,
							currency: tariffSell.currency,
						});
					});
			}
			if (base === 0) {
				products
					.filter((product) => parseInt(product.id) === id)
					.forEach((product) => {
						if (product.variantId === '')
							return productsToChange.push({
								tariffId: tariffBase.tariff,
								itemId: parseInt(product.id),
								grossPrice: '',
								tax: tariffBase.tax,
								currency: tariffBase.currency,
							});
						return variantsToChange.push({
							tariffId: tariffBase.tariff,
							itemId: parseInt(product.variantId),
							grossPrice: '',
							tax: tariffBase.tax,
							currency: tariffBase.currency,
						});
					});
			}
			if (sell === 0) {
				products
					.filter((product) => parseInt(product.id) === id)
					.forEach((product) => {
						if (product.variantId === '')
							return productsToChange.push({
								tariffId: tariffSell.tariff,
								itemId: parseInt(product.id),
								grossPrice: '',
								tax: tariffSell.tax,
								currency: tariffSell.currency,
							});
						return variantsToChange.push({
							tariffId: tariffSell.tariff,
							itemId: parseInt(product.variantId),
							grossPrice: '',
							tax: tariffSell.tax,
							currency: tariffSell.currency,
						});
					});
			}
		} else {
			const { id, variants } = item;
			const preparedBaseVariants = [];
			const preparedSellVariants = [];
			let preparedBaseProducts = {};
			let preparedSellProducts = {};
			products
				.filter((product) => parseInt(product.id) === id)
				.forEach((product) => {
					const variant = variants.find((variant) => variant.variantId === parseInt(product.variantId));
					if (variant !== undefined) {
						if (variant.base > 0) {
							const variantPrice = calculatePrice(variant.base, lang.toLowerCase(), variant.category);
							preparedBaseVariants.push({
								tariffId: tariffBase.tariff,
								id: variant.id,
								variantId: variant.variantId,
								price: variantPrice,
								category: variant.category,
								sku: variant.sku,
								count: variant.count,
								changedPrice: true,
								tax: tariffBase.tax,
								currency: tariffBase.currency,
							});
						}
						if (variant.sell > 0) {
							const variantPrice = calculatePrice(variant.sell, lang.toLowerCase(), variant.category);
							preparedSellVariants.push({
								tariffId: tariffSell.tariff,
								id: variant.id,
								variantId: variant.variantId,
								price: variantPrice,
								category: variant.category,
								sku: variant.sku,
								count: variant.count,
								changedPrice: true,
								tax: tariffSell.tax,
								currency: tariffSell.currency,
							});
						}
						if (variant.base === 0) {
							preparedBaseVariants.push({
								tariffId: tariffBase.tariff,
								id: variant.id,
								variantId: variant.variantId,
								price: '',
								category: variant.category,
								sku: variant.sku,
								count: variant.count,
								changedPrice: true,
								tax: tariffBase.tax,
								currency: tariffBase.currency,
							});
						}
						if (variant.sell === 0) {
							preparedSellVariants.push({
								tariffId: tariffSell.tariff,
								id: variant.id,
								variantId: variant.variantId,
								price: '',
								category: variant.category,
								sku: variant.sku,
								count: variant.count,
								changedPrice: true,
								tax: tariffSell.tax,
								currency: tariffSell.currency,
							});
						}
					} else {
						if (product.variantId === '') {
							preparedBaseProducts = {
								tariffId: tariffBase.tariff,
								id: parseInt(product.id),
								variantId: '',
								price: product.basePrice[lang.toLowerCase() === 'ua' ? 'uk' : lang.toLowerCase()].price,
								category: '',
								sku: '',
								count: 0,
								changedPrice: false,
								tax: tariffBase.tax,
								currency: tariffBase.currency,
							};
							preparedSellProducts = {
								tariffId: tariffSell.tariff,
								id: parseInt(product.id),
								variantId: '',
								price: product.sellPrice[lang.toLowerCase() === 'ua' ? 'uk' : lang.toLowerCase()].price,
								category: '',
								sku: '',
								count: 0,
								changedPrice: false,
								tax: tariffSell.tax,
								currency: tariffSell.currency,
							};
						} else {
							preparedBaseVariants.push({
								tariffId: tariffBase.tariff,
								id: parseInt(product.id),
								variantId: parseInt(product.variantId),
								price: product.basePrice[lang.toLowerCase() === 'ua' ? 'uk' : lang.toLowerCase()].price,
								category: '',
								sku: '',
								count: 0,
								changedPrice: false,
								tax: tariffBase.tax,
								currency: tariffBase.currency,
							});
							preparedSellVariants.push({
								tariffId: tariffSell.tariff,
								id: parseInt(product.id),
								variantId: parseInt(product.variantId),
								price: product.sellPrice[lang.toLowerCase() === 'ua' ? 'uk' : lang.toLowerCase()].price,
								category: '',
								sku: '',
								count: 0,
								changedPrice: false,
								tax: tariffSell.tax,
								currency: tariffSell.currency,
							});
						}
					}
				});

			const lowestBaseVariantPrice = preparedBaseVariants.sort((a, b) => a.price - b.price)[0].price;
			const lowestSellVariantPrice = preparedSellVariants.sort((a, b) => a.price - b.price)[0].price;

			productsToChange.push(
				...[
					{
						tariffId: preparedBaseProducts.tariffId,
						itemId: preparedBaseProducts.id,
						grossPrice: lowestBaseVariantPrice,
						tax: preparedBaseProducts.tax,
						currency: preparedBaseProducts.currency,
					},
					{
						tariffId: preparedSellProducts.tariffId,
						itemId: preparedSellProducts.id,
						grossPrice: lowestSellVariantPrice,
						tax: preparedSellProducts.tax,
						currency: preparedSellProducts.currency,
					},
				]
			);

			preparedBaseVariants
				.filter((item) => item.changedPrice)
				.forEach((item) =>
					variantsToChange.push({
						tariffId: item.tariffId,
						itemId: item.variantId,
						grossPrice: item.price,
						tax: item.tax,
						currency: item.currency,
					})
				);
			preparedSellVariants
				.filter((item) => item.changedPrice)
				.forEach((item) =>
					variantsToChange.push({
						tariffId: item.tariffId,
						itemId: item.variantId,
						grossPrice: item.price,
						tax: item.tax,
						currency: item.currency,
					})
				);
		}
	});

	return { [`${tariffConfig.find((tariff) => tariff.code === lang.toLowerCase()).country}`]: { splitedVariant: chunker(variantsToChange, 5000), splitedProduct: chunker(productsToChange, 5000) } };
};

export const generatePriceChangeFeed = async (products, config) => {
	return new Promise((resolve) => {
		(async () => {
			const shouldRun = await runFeedGenerator(config.name);
			if (!shouldRun) return resolve();
			await priceChangeFeed(products, config);
			await runFeedGenerator(config.name, true);
			resolve();
		})();
	});
};
const { getProducts } = await import('./processFeed.js');
const products = await getProducts();
// //
// // await priceChangeFeed(products, { chunks: 5000 });

// const collectAllChanges = async () => {
// 	const priceChanges = await getPricesToChange(products);
//
// 	const pri = priceChanges
// 		.map((change) => {
// 			if (change.data.length === 0) return;
// 			if (change.lang === 'WSZYSTKIE') {
// 				const langs = Array.from(new Set(tariffConfig.map((conf) => conf.code)));
// 				return { Wszystkie: langs.map((lang) => preparePrices(products, { lang, data: change.data })) };
// 			}
// 			return preparePrices(products, change);
// 		})
// 		.filter(Boolean);
// 	console.log(pri);
// };
const collectAllChanges = async () => {
	const priceChanges = await getPricesToChange(products);

	let result = {};

	for (const change of priceChanges) {
		if (!change?.data?.length) continue;

		if (change.lang === 'WSZYSTKIE') {
			const langs = [...new Set(tariffConfig.map((conf) => conf.code))];

			const allForAll = Object.fromEntries(langs.map((lang) => [lang, preparePrices(products, { lang, data: change.data })]));

			result.Wszystkie = { ...(result.Wszystkie || {}), ...allForAll };
		} else {
			result = { ...result, ...preparePrices(products, change) };
		}
	}
	return result;
};

await collectAllChanges();

// console.log(preparePrices(products, pr[3]));
// await pushNBPCurrencies();
// await pushCategroiesMapping(products);
await mongoose.connection.close();
