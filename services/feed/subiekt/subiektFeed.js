import sql from 'mssql';
import { connectToGoogleSheets } from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';

const sqlConfig = {
	user: 'sa',
	password: '',
	database: 'PODLASIAK',
	server: `192.168.1.2\\insertsql`,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
	options: {
		encrypt: true, // for azure
		trustServerCertificate: true, // change to true for local dev / self-signed certs
	},
};

const getSubiektProducts = async () => {
	return new Promise(async (resolve) => {
		await sql.connect(sqlConfig);
		const queryProducts = await sql.query`SELECT * FROM tw__Towar`;
		const queryMag = await sql.query`SELECT * FROM sl_Magazyn`;
		const queryStock = await sql.query`SELECT * FROM tw_Stan`;
		const queryProductsGroup = await sql.query`SELECT * FROM sl_GrupaTw`;
		const mags = queryMag.recordset
			.map((mag) => {
				if (
					mag.mag_Nazwa === 'CH Fasty' ||
					mag.mag_Nazwa === 'EDI' ||
					mag.mag_Nazwa === 'Galeria Topaz'
				)
					return;
				return {
					id: mag.mag_Id,
					name: mag.mag_Nazwa,
				};
			})
			.filter(Boolean);

		const stock = queryStock.recordset
			.map((stock) => {
				const currentMag = mags.filter(
					(mag) => mag.id === stock.st_MagId
				);
				if (currentMag.length > 0)
					return {
						productId: stock.st_TowId,
						mag: currentMag[0].name,
						stock: stock.st_Stan,
						booked: stock.st_StanRez,
						available: stock.st_Stan - stock.st_StanRez,
					};
			})
			.filter(Boolean)
			.reduce((previousValue, currentValue) => {
				const previousIndex = previousValue.findIndex(
					(prev) => prev.productId === currentValue.productId
				);
				if (previousIndex === -1) {
					return [
						...previousValue,
						{
							productId: currentValue.productId,
							[`Stan`]: currentValue.stock,
							[`Rezerwacje`]: currentValue.booked,
							[`Dostępne`]: currentValue.available,
						},
					];
				} else {
					previousValue[previousIndex][`Stan`] =
						previousValue[previousIndex][`Stan`] +
						currentValue.stock;
					previousValue[previousIndex][`Rezerwacje`] =
						previousValue[previousIndex][`Rezerwacje`] +
						currentValue.booked;
					previousValue[previousIndex][`Dostępne`] =
						previousValue[previousIndex][`Dostępne`] +
						currentValue.available;

					return previousValue;
				}
			}, []);

		const products = queryProducts.recordset
			.map((product) => {
				const group = queryProductsGroup.recordset.filter(
					(group) => group.grt_Id === product.tw_IdGrupa
				);
				const stockIndex = stock.findIndex(
					(stock) => stock.productId === product.tw_Id
				);
				delete stock[stockIndex].productId;
				const currentStock = stock[stockIndex];
				return {
					Rodzaj:
						product.tw_Rodzaj === 1
							? 'Towar'
							: product.tw_Rodzaj === 2
								? 'Usługa'
								: product.tw_Rodzaj === 8
									? 'Komplet'
									: 'Opakowanie zwrotne',
					SKU: product.tw_Symbol,
					EAN: product.tw_PKWiU,
					Nazwa: product.tw_Nazwa,
					'Grupa Towarowa':
						group.length === 0 ? '' : group[0].grt_Nazwa,
					...currentStock,
					Opis: product.tw_Uwagi,
				};
			})
			.filter((product) => {
				return product;
			});
		resolve(products);
	});
};

export const generateSubiektFeed = () => {
	return new Promise(async (resolve) => {
		await getSubiektProducts().then(async (data) => {
			await connectToGoogleSheets(
				'1VHOE9a1QxmPc4XdC979f7NltHBTiDMcWoX792nrj45Y'
			).then(async (document) => {
				const sheet = await document.sheetsByTitle['Subiekt - Towar'];
				const headers = Object.keys(data[0]);
				await sheet.setHeaderRow([
					...headers,
					format(Date.now(), 'dd-MM-yyyy HH:mm:ss'),
				]);
				await sheet.clearRows();
				await sheet.addRows(data);
			});
		});
		resolve();
	});
};
