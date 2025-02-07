import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { keys } from './polasiak.js';
import mongoose from 'mongoose';
import Product from '../../../../models/Product.js';
import { feedsConfig } from '../../../../config/config.js';

dotenv.config({ path: '../../../../.env' });

const feeds = [];
for (const [key, value] of Object.entries(feedsConfig)) {
	feeds.push(key);
}
const HEADERS = [
	'uid',
	'active',
	'id',
	'variantId',
	'activeVariant',
	'sku',
	'ean',
	'brand',
	'aliases',
	'name',
	'variantNames',
	...feeds,
];

mongoose.set('strictQuery', true);
await mongoose.connect(
	process.env.DATABASE_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 0,
		socketTimeoutMS: 0,
		connectTimeoutMS: 0,
		heartbeatFrequencyMS: 2000,
	},
	(error) => {
		if (error) {
			console.log(error);
		}
	}
);
mongoose.connection.on('error', (err) => console.log(err));

const connectToGoogleSheets = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const serviceAccountAuth = new JWT({
				email: keys.client_email,
				key: keys.private_key,
				scopes: ['https://www.googleapis.com/auth/spreadsheets'],
			});

			const doc = new GoogleSpreadsheet(
				process.env.GOOGLE_PODLASIAK_FEEDS_SHEET_ID,
				serviceAccountAuth
			);
			await doc.loadInfo();
			console.log('Połączono z Google Sheets');
			resolve(doc);
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

const createOrSelectSheetGoogleSheets = (document) => {
	return new Promise(async (resolve) => {
		console.log('Pobieranie Arkuszy');
		const sheets = await document.sheetsByTitle;
		const sheetTitles = [];
		for (const title of Object.keys(sheets)) {
			sheetTitles.push(title);
		}
		console.log('Pobieranie danych z bazy');
		const dbProducts = await Product.find();
		const products = dbProducts.map((product) => ({
			uid: product.uid,
			active: product.active,
			id: product.id,
			activeVariant: product.activeVariant,
			variantId: product.variantId,
			sku: product.sku,
			ean: product.ean,
			brand: product.producer,
			aliases: product.aliases.join(', '),
			name: product.title[0].pl,
			variantName: product.variantName[0].pl,
		}));
		console.log('Przetwarzanie danych');
		const productsBrands = products
			.map((product) => product.brand)
			.reduce((prev, curr) => {
				if (prev.some((name) => name === curr)) return prev;
				return [...prev, curr];
			}, []);
		console.log('Sprawdzanie Arkuszy');
		const notExistingSheets = productsBrands.filter((brand) => {
			const exist = sheetTitles.includes(
				brand === '' ? 'Brak producenta' : brand
			);
			return !exist;
		});
		console.log('Dodawanie brakujących Arkuszy');
		notExistingSheets.map(async (notExisiting) => {
			if (notExisiting === '')
				return await document.addSheet({
					title: 'Brak producenta',
					headerValues: HEADERS,
					headerRowIndex: 0,
				});
			return await document.addSheet({
				title: notExisiting,
				headerValues: HEADERS,
				headerRowIndex: 0,
			});
		});
		console.log('Dodano brakujące Arkusze');
		console.log('-----');
		resolve({ sheetTitles: productsBrands, products, document });
	});
};

const setSheetFormatingGoogleSheets = ({ sheetTitles, products, document }) => {
	return new Promise(async (resolve) => {
		const sheets = await document.sheetsByTitle;
		const loadedSheets = [];
		for (const sheet of Object.values(sheets)) {
			loadedSheets.push(sheet);
		}

		loadedSheets.map(async (sheet) => {
			const rows = await sheet.getRows();
			if (rows.length !== 1 && rows[0].get('id') !== 'id') {
				await sheet.resize({
					columnCount: HEADERS.length,
					rowCount: 2,
				});
			}
		});
		resolve({ sheetTitles, products, documents: loadedSheets });
	});
};

const checkGoogleSheetsData = ({ products, documents }) => {
	return new Promise(async (resolve) => {
		const items = documents.map(async (document) => {
			console.log(document.headerValues);
			const rows = await document.getRows();
			if (rows.length === 1 && rows[0].get('id') === 'id') {
				return { data: [], document };
			} else {
				await document.loadCells();
				const data = rows.map((row, rowIndex) => {
					const item = {};
					document.headerValues.forEach(
						(headerValue, columnIndex) => {
							const cellValue = document.getCell(
								rowIndex + 1,
								columnIndex
							).formattedValue;
							if (cellValue === 'TRUE')
								return (item[headerValue] = true);
							if (cellValue === 'FALSE')
								return (item[headerValue] = false);
							if (
								headerValue === 'uid' ||
								headerValue === 'id' ||
								headerValue === 'variantId'
							)
								return (item[headerValue] =
									parseInt(cellValue));
							return (item[headerValue] = cellValue);
						}
					);
					return item;
				});
				return { data, document };
			}
		});
		console.log(items, products);
		resolve({ items, products });
	});
};

const checkAndUpdateHeaders = async (data, document) => {
	await document.resize({
		columnCount: HEADERS.length,
	});
	await document.setHeaderRow(HEADERS, 0);
	return data.map((product) => {
		let item = {};
		HEADERS.forEach((header) => {
			if (product[header] === undefined) return (item[header] = false);
			return (item[header] = product[header]);
		});

		return item;
	});
};

const compareGoogleSheetsData = ({ data, document }) => {
	return new Promise(async (resolve) => {
		const updatedData = await checkAndUpdateHeaders(data, document);

		const products = await Product.find();
		const prod = products.map((product) => ({
			uid: product.uid,
			active: product.active,
			id: product.id,
			activeVariant: product.activeVariant,
			variantId: product.variantId,
			sku: product.sku,
			ean: product.ean,
			brand: product.producer,
			aliases: product.aliases.join(', '),
			name: product.title[0].pl,
			variantName: product.variantName[0].pl,
		}));
		const notExisting = prod
			.filter(
				(product) =>
					!updatedData.some(
						(existing) => existing.uid === product.uid
					)
			)
			.map((product) => {
				const productFeeds = feeds.reduce((prev, curr) => {
					return { ...prev, [curr]: false };
				}, {});
				return { ...product, ...productFeeds };
			});

		resolve({ data: notExisting, document });
	});
};
const populateGoogleSheets = ({ data, document }) => {
	return new Promise(async (resolve) => {
		if (data.length === 0) return resolve(document);
		await document.addRows(data);
		resolve(document);
	});
};
const setValidationGoogleSheets = (document) => {
	return new Promise(async (resolve) => {
		await document.setDataValidation([
			{
				startColumnIndex: 2,
				endColumnIndex: 2,
				startRowIndex: 1,
				endRowIndex: document.rowCount,
			},
			{
				condition: {
					type: 'BOOLEAN',
					values: [
						{ userEnteredValue: 'TRUE' },
						{ userEnteredValue: 'FALSE' },
					],
				},
				strict: true,
				showCustomUi: true,
			},
		]);
		// await document.setDataValidation(
		// 	{
		// 		startColumnIndex: 4,
		// 		endColumnIndex: 4,
		// 		startRowIndex: 1,
		// 		endRowIndex: document.rowCount,
		// 	},
		// 	{
		// 		condition: {
		// 			type: 'BOOLEAN',
		// 			values: [
		// 				{ userEnteredValue: 'TRUE' },
		// 				{ userEnteredValue: 'FALSE' },
		// 			],
		// 		},
		// 		strict: true,
		// 		showCustomUi: true,
		// 	}
		// );
		// await document.setDataValidation(
		// 	{
		// 		startColumnIndex: HEADERS.length - feeds.length,
		// 		endColumnIndex: HEADERS.length,
		// 		startRowIndex: 1,
		// 		endRowIndex: document.rowCount,
		// 	},
		// 	{
		// 		condition: {
		// 			type: 'BOOLEAN',
		// 			values: [
		// 				{ userEnteredValue: 'TRUE' },
		// 				{ userEnteredValue: 'FALSE' },
		// 			],
		// 		},
		// 		strict: true,
		// 		showCustomUi: true,
		// 	}
		// );
		resolve(document);
	});
};
const setFormatingsGoogleSheets = (document) => {
	return new Promise(async (resolve) => {
		// await document.loadCells();
		resolve();
	});
};

// await connectToGoogleSheets().then((data) => {
// 	createOrSelectSheetGoogleSheets(data).then((data) => {
// 		setSheetFormatingGoogleSheets(data).then((data) => {
// 			checkGoogleSheetsData(data);
// 		});
// 	});
// checkGoogleSheetsData(data).then((data) => {
// 	compareGoogleSheetsData(data).then((data) => {
// 		populateGoogleSheets(data).then((data) => {
// 			setValidationGoogleSheets(data).then((data) => {
// 				setFormatingsGoogleSheets(data).then(async () => {
//
// 				});
// 			});
// 		});
// 	});
// });
// });
// await mongoose.connection.close();
