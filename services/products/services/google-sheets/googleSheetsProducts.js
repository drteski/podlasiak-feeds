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
	'id',
	'variantId',
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
			const sheet = await doc.sheetsByTitle['Products'];
			resolve(sheet);
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

const checkGoogleSheetsData = (document) => {
	return new Promise(async (resolve) => {
		const rows = await document.getRows();
		if (rows.length === 1 && rows[0].get('id') === 'id') {
			resolve({ data: [], document });
		} else {
			await document.loadCells();
			const data = rows.map((row, rowIndex) => {
				const item = {};
				document.headerValues.forEach((headerValue, columnIndex) => {
					const cellValue = document.getCell(
						rowIndex + 1,
						columnIndex
					).formattedValue;
					if (cellValue === 'TRUE') return (item[headerValue] = true);
					if (cellValue === 'FALSE')
						return (item[headerValue] = false);
					if (
						headerValue === 'uid' ||
						headerValue === 'id' ||
						headerValue === 'variantId'
					)
						return (item[headerValue] = parseInt(cellValue));
					return (item[headerValue] = cellValue);
				});
				return item;
			});
			resolve({ data, document });
		}
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
		const prod = products.slice(100, 110).map((product) => ({
			uid: product.uid,
			id: product.id,
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
		const rows = await document.getRows();
		// const rowsToDelete = rows.filter(
		// 	(row) => typeof row.get('uid') !== 'string'
		// );
		// await Promise.all(rowsToDelete.reverse().map((row) => row.delete()));
		// console.log('');
		// console.log(rowsToDelete.length);
		// console.log(document.rowCount);
		const addedItems = data.map(async (product, rowIndex) => {
			await document.addRow(product);
			(() => {
				setTimeout(() => {}, 100);
			})();

			// Object.entries(product).forEach((object, cellIndex) => {
			// 	const cell = document.getCell(rowIndex, cellIndex);
			// 	if (cellIndex <= 8) {
			// 		cell.value = object[1];
			// 		cell.textFormat = { bold: false };
			// 	} else {
			// 		cell.value = object[1] === true ? 'TRUE' : 'FALSE';
			// 		cell.textFormat = { bold: false };
			// 	}
			// });
			// for (const [keys, index, i] of Object.entries(product)) {
			// 	console.log(keys, index, i);
			// }
			// await document.addRow(product);
		});
		resolve();
	});
};

await connectToGoogleSheets().then((data) => {
	checkGoogleSheetsData(data).then((data) => {
		compareGoogleSheetsData(data).then((data) => {
			populateGoogleSheets(data).then(async () => {
				await mongoose.connection.close();
			});
		});
	});
});
