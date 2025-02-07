import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
export const connectToGoogleSheets = (sheetId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const serviceAccountAuth = new JWT({
				email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
				key: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
				scopes: ['https://www.googleapis.com/auth/spreadsheets'],
			});

			const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
			await doc.loadInfo();
			resolve(doc);
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

export const getDataFromSheets = (document, title = 'Arkusz1') => {
	return new Promise(async (resolve) => {
		const sheet = await document.sheetsByTitle[title];
		const rows = await sheet.getRows();
		const data = rows.map((row) => {
			return row.toObject();
		});
		resolve(data);
	});
};
