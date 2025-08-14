import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const connectToGoogleSheets = (sheetId, maxRetries = 3) => {
	return new Promise((resolve) => {
		(async () => {
			let attempts = 0;

			while (attempts < maxRetries) {
				try {
					const serviceAccountAuth = new JWT({
						email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
						key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
						scopes: ['https://www.googleapis.com/auth/spreadsheets'],
					});

					const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
					await doc.loadInfo();
					return resolve(doc);
				} catch (error) {
					attempts++;

					const isNetworkError = error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND';

					const isPermissionError = error?.response?.status === 403 || error?.message?.includes('The caller does not have permission');

					if (isPermissionError) {
						console.warn(`[Google Sheets] Brak uprawnień do dokumentu ${sheetId}. Kontynuuję...`);
						return resolve(null);
					}

					if (isNetworkError) {
						console.warn(`[Google Sheets] Błąd sieciowy (próba ${attempts}/${maxRetries}) – retry...`);
						await new Promise((r) => setTimeout(r, 1000 * attempts));
						continue;
					}

					console.error(`[Google Sheets] Nieoczekiwany błąd:`, error);
					break;
				}
			}

			console.warn(`[Google Sheets] Nie udało się połączyć z arkuszem ${sheetId} po ${maxRetries} próbach. Kontynuuję...`);
			resolve(null);
		})();
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
