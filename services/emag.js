import axios from 'axios';
import { connectToGoogleSheets, getDataFromSheets } from '../utilities/googleSheets.js';
import { format } from 'date-fns';

let username = 'sklep@loristo.pl';
let password = 'RKeL846';
let sheet = '10kh2A7S_m4mRmHEGluc-Zl6QErV61lvHDjr1xGTpEfk';

// username = 'bogumila.anchim@rea.pl';
// password = 'wUN1PTS';
// sheet = '1AAy0UnT2kzVnmpF_gDzCQp4yjNU1T2yfv_9hzzAsz_A';

const token = Buffer.from(`${username}:${password}`).toString('base64');

const attachOffer = {
	id: '',
	name: '',
	ean: '',
	part_number_key: '',
	status: '',
	sale_price: '',
	min_sale_price: '',
	max_sale_price: '',
	vat_id: '',
	stock: [{ warehouse_id: '', value: '' }],
	handling_time: [{ warehouse_id: '', value: '' }],
	warranty: 24,
};

const existingOffer = {
	id: '',
	status: '',
	sale_price: '',
	vat_id: '',
	stock: [{ warehouse_id: '', value: '' }],
	handling_time: [{ warehouse_id: '', value: '' }],
};

const getEmagProducts = async () => {
	const productCount = await axios
		.post(
			'https://marketplace-api.emag.ro/api-3/product_offer/count',
			{},
			{
				headers: {
					Authorization: `Basic ${token}`,
				},
			}
		)
		.then((res) => ({ pages: parseInt(res.data.results.noOfPages), totalItems: parseInt(res.data.results.noOfItems), itemsPerPage: parseInt(res.data.results.itemsPerPage) }));

	const products = [];
	for await (const page of [...Array(productCount.pages).keys()]) {
		await axios
			.post(
				`https://marketplace-api.emag.ro/api-3/product_offer/read`,
				{ currentPage: page + 1 },
				{
					headers: {
						Authorization: `Basic ${token}`,
					},
				}
			)
			.then((res) => products.push(...res.data.results));
	}

	return products.map((product) => ({
		id: product.id,
		ean: product.ean[0],
		part_number_key: product.part_number_key,
		part_number: product.part_number,
		category_id: product.category_id,
		name: product.name,
		brand_name: product.brand_name,
		brand: product.brand,
		status: product.status,
		sale_price: product.sale_price,
		recommended_price: product.recommended_price,
		min_sale_price: product.min_sale_price,
		max_sale_price: product.max_sale_price,
		best_offer_sale_price: product.best_offer_sale_price,
		best_offer_recommended_price: product.best_offer_recommended_price,
		currency: product.currency,
		vat_id: product.vat_id,
		stock: product.stock[0].value,
		general_stock: product.general_stock,
		estimated_stock: product.estimated_stock,
		availability: product.availability[0].value,
		handling_time: product.handling_time[0].value,
		warranty: product.warranty,
		ownership: product.ownership,
		number_of_offers: product.number_of_offers,
	}));
};

export const pushEmagData = async () => {
	const emagProducts = await getEmagProducts();
	// console.dir(emagProducts[0], { maxArrayLength: null });
	await connectToGoogleSheets(sheet).then(async (document) => {
		const sheet = await document.sheetsByTitle['PRODUKTY - RO'];
		const headers = Object.keys(emagProducts[0]);
		await sheet.setHeaderRow([...headers, format(Date.now(), 'dd-MM-yyyy HH:mm:ss')]);
		await sheet.clearRows();
		await sheet.addRows(emagProducts);
	});
	const stockPrices = emagProducts.map((product, index) => ({
		id: product.id,
		name: product.name,
		ean: product.ean,
		part_number_key: product.part_number_key,
		sale_price: product.sale_price,
		min_sale_price: `=$E$${index + 2}*0,5`,
		max_sale_price: `=$E$${index + 2}*1,5`,
		stock: product.stock,
		status: product.status,
		vat_id: product.vat_id,
		handling_time: product.handling_time,
		warranty: 24,
	}));

	await connectToGoogleSheets(sheet).then(async (document) => {
		const sheet = await document.sheetsByTitle['STANY CENY - RO'];
		const headers = Object.keys(stockPrices[0]);
		await sheet.setHeaderRow([...headers, format(Date.now(), 'dd-MM-yyyy HH:mm:ss')]);
		await sheet.clearRows();
		await sheet.addRows(stockPrices);
	});
};

const pushOffers = async () => {
	const products = await connectToGoogleSheets(sheet).then((document) => getDataFromSheets(document, 'STANY CENY - RO').then((data) => data));
	const offers = products.map((product) => ({
		id: product.id,
		// name: product.name,
		// ean: [product.ean],
		// part_number_key: product.part_number_key,
		status: product.status,
		// sale_price: product.sale_price,
		// min_sale_price: product.min_sale_price,
		// max_sale_price: product.max_sale_price,
		// vat_id: 1,
		// stock: [
		// 	{
		// 		warehouse_id: 1,
		// 		value: product.stock,
		// 	},
		// ],
		// handling_time: [
		// 	{
		// 		warehouse_id: 1,
		// 		value: product.handling_time,
		// 	},
		// ],
		// warranty: 24,
	}));
	for await (const product of products) {
		await axios
			.post(
				`https://marketplace-api.emag.ro/api-3/product_offer/save`,
				{
					data: [{ id: product.id, status: product.status }],
				},
				{
					headers: {
						Authorization: `Basic ${token}`,
					},
				}
			)
			.then((res) => console.log(res.data));
	}
};

// await pushEmagData();
await pushOffers();
