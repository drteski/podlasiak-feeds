import { getSubiektProducts } from '../subiekt/subiektFeed.js';
import { connectToGoogleSheets, getDataFromSheets } from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';

const subiektProducts = await getSubiektProducts();

const dimensionsFeed = async (data, language, options) => {
	const dimensions = await connectToGoogleSheets('1uXVoUeXeZyb198Za88ERRaDX5KYr_tV_rgt1sFcrlCQ').then((document) => getDataFromSheets(document, 'WYMIARY').then((data) => data));
	return subiektProducts
		.map((product) => {
			const { Rodzaj, SKU, Nazwa, Dostępne } = product;
			const storeProduct = data.filter((item) => item.sku.toLowerCase() === SKU.toLowerCase());
			const dimensionsProduct = dimensions.filter((item) => item['sku\nSKU'].toLowerCase() === SKU.toLowerCase());
			if (storeProduct.length > 0) {
				return {
					'id\nID': storeProduct[0].id,
					'variantId\nVARIANT ID': storeProduct[0].variantId,
					'sku\nSKU': SKU,
					'ean\nEAN': storeProduct[0].ean,
					'hsCode\nKOD HS': dimensionsProduct.length > 0 ? dimensionsProduct[0]['hsCode\nKOD HS'] : '',
					'name\nNAZWA': Nazwa,
					'type\nRODZAJ': Rodzaj,
					'producer\nMARKA': storeProduct[0].producer,
					'group\nGRUPA TOWAROWA': product['Grupa Towarowa'],
					'stock\nSTAN MAGAZYNOWY': Dostępne < 0 ? 0 : Dostępne,
					'certificates\nATESTY': dimensionsProduct.length > 0 ? dimensionsProduct[0]['certificates\nATESTY'] : '',
					'additionalPackaging\nDODATKOWE PAKOWANIE': dimensionsProduct.length > 0 ? dimensionsProduct[0]['additionalPackaging\nDODATKOWE PAKOWANIE'] : '',
					'weightNett\nWAGA NETTO\n[kg]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['weightNett\nWAGA NETTO\n[kg]'] : '',
					'length\nDŁUGOŚĆ\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['length\nDŁUGOŚĆ\n[mm]'] : '',
					'width\nSZEROKOŚĆ\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['width\nSZEROKOŚĆ\n[mm]'] : '',
					'height\nWYSOKOŚĆ\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['height\nWYSOKOŚĆ\n[mm]'] : '',
					'weightGross\nWAGA BRUTTO\n[kg]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['weightGross\nWAGA BRUTTO\n[kg]'] : '',
					'package_length\nDŁUGOŚĆ OPAKOWANIA\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['package_length\nDŁUGOŚĆ OPAKOWANIA\n[mm]'] : '',
					'package_width\nSZEROKOŚĆ OPAKOWANIA\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['package_width\nSZEROKOŚĆ OPAKOWANIA\n[mm]'] : '',
					'package_height\nWYSOKOŚĆ OPAKOWANIA\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['package_height\nWYSOKOŚĆ OPAKOWANIA\n[mm]'] : '',
					'notes\nUWAGI': dimensionsProduct.length > 0 ? dimensionsProduct[0]['notes\nUWAGI'] : '',
				};
			}
			return {
				'id\nID': '',
				'variantId\nVARIANT ID': '',
				'sku\nSKU': SKU,
				'ean\nEAN': '',
				'hsCode\nKOD HS': dimensionsProduct.length > 0 ? dimensionsProduct[0]['hsCode\nKOD HS'] : '',
				'name\nNAZWA': Nazwa,
				'type\nRODZAJ': Rodzaj,
				'producer\nMARKA': '',
				'group\nGRUPA TOWAROWA': product['Grupa Towarowa'],
				'stock\nSTAN MAGAZYNOWY': Dostępne < 0 ? 0 : Dostępne,
				'certificates\nATESTY': dimensionsProduct.length > 0 ? dimensionsProduct[0]['certificates\nATESTY'] : '',
				'additionalPackaging\nDODATKOWE PAKOWANIE': dimensionsProduct.length > 0 ? dimensionsProduct[0]['additionalPackaging\nDODATKOWE PAKOWANIE'] : '',
				'weightNett\nWAGA NETTO\n[kg]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['weightNett\nWAGA NETTO\n[kg]'] : '',
				'length\nDŁUGOŚĆ\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['length\nDŁUGOŚĆ\n[mm]'] : '',
				'width\nSZEROKOŚĆ\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['width\nSZEROKOŚĆ\n[mm]'] : '',
				'height\nWYSOKOŚĆ\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['height\nWYSOKOŚĆ\n[mm]'] : '',
				'weightGross\nWAGA BRUTTO\n[kg]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['weightGross\nWAGA BRUTTO\n[kg]'] : '',
				'package_length\nDŁUGOŚĆ OPAKOWANIA\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['package_length\nDŁUGOŚĆ OPAKOWANIA\n[mm]'] : '',
				'package_width\nSZEROKOŚĆ OPAKOWANIA\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['package_width\nSZEROKOŚĆ OPAKOWANIA\n[mm]'] : '',
				'package_height\nWYSOKOŚĆ OPAKOWANIA\n[mm]': dimensionsProduct.length > 0 ? dimensionsProduct[0]['package_height\nWYSOKOŚĆ OPAKOWANIA\n[mm]'] : '',
				'notes\nUWAGI': dimensionsProduct.length > 0 ? dimensionsProduct[0]['notes\\nUWAGI'] : '',
			};
		})
		.filter(Boolean)
		.sort((a, b) => {
			if (a === '' || b === '') return 0;
			if (parseInt(a['id\nID']) > parseInt(b['id\nID'])) {
				return -1;
			} else {
				return 1;
			}
		});
};
const uploadDimensionsFeed = (data) => {
	return new Promise((resolve) => {
		(async () => {
			await connectToGoogleSheets('1uXVoUeXeZyb198Za88ERRaDX5KYr_tV_rgt1sFcrlCQ').then(async (document) => {
				const sheet = await document.sheetsByTitle.WYMIARY;
				const headers = Object.keys(data[0]);
				await sheet.setHeaderRow([...headers, format(Date.now(), 'dd-MM-yyyy HH:mm:ss')]);
				await sheet.clearRows();
				await sheet.addRows(data);
			});
			resolve();
		})();
	});
};

export const generateDimensionsFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		await dimensionsFeed(products, 'pl', config).then((data) => uploadDimensionsFeed(data));
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
