import axios from 'axios';
import { LocalStorage } from 'node-localstorage';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import EN from '../models/EN.js';
import fs from 'fs';
import { onbuyCategories } from '../data/onbuyCategories.js';

import ObjectsToCsv from 'objects-to-csv-file';

const localStorage = new LocalStorage('./scratch');

dotenv.config({ path: '../.env' });

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 10000,
});
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => {
	console.log('Połączono z DB');
});

let token;

const getToken = async () => {
	token = await axios
		.get('https://api.onbuy.com/v2/auth/request-token', {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			params: {
				secret_key: process.env.ON_BUY_SECRET_KEY,
				consumer_key: process.env.ON_BUY_CUSTOMER_KEY,
			},
		})
		.then((res) => res.data);
};

const prepareData = async () => {
	const products = await EN.find();
	const data = [];
	products.forEach((product) => {
		const {
			domain,
			variantId,
			brand,
			title,
			stock,
			description,
			ean,
			media,
			attributes,
			price,
			sku,
		} = product;
		if (domain !== 'Rea') return;
		if (ean === null || ean === undefined) return;
		const filteredMedia = media.map((med) => {
			const { url, main } = med;
			return { url, main };
		});
		const filteredAttrs = attributes.map((attribute) => {
			const { name, value } = attribute;
			return { label: name, value };
		});
		onbuyCategories.forEach((cat) => {
			if (cat.variantId === variantId) {
				data.push({
					uid: `${variantId}`,
					category_id: cat.category_id.toString(),
					published: '1',
					product_name: title,
					mpn: sku,
					product_codes: [`${ean}`],
					summary_points: ['summary point 1', 'summary point 2'],
					description,
					brand_name: brand,
					default_image: filteredMedia[0].url,
					rrp: `${price}`,
					product_data: filteredAttrs,
					listings: {
						new: {
							sku,
							price,
							stock,
							handling_time: 4,
						},
					},
				});
			}
		});
	});
	return data;
};

const testData = {
	site_id: 2000,
	products: [
		{
			uid: 'myref2619',
			category_id: '2584',
			published: '1',
			product_name: 'A kettle',
			mpn: 'mpn5130',
			product_codes: ['5079735805360'],
			summary_points: ['summary point 1', 'summary point 2'],
			description: 'some descriptive stuff here',
			brand_name: 'Igenix',
			default_image: 'http://myexamplesite.com/photos/p5079735805360.png',
			rrp: '24.99',
			product_data: [
				{
					label: 'label 1',
					value: 'value 1',
				},
				{
					label: 'label 2',
					value: 'value 2',
				},
			],
			listings: {
				new: {
					sku: 'sku1276',
					price: 39.99,
					stock: 3,
					handling_time: 4,
				},
			},
		},
		{
			uid: 'myref5170',
			category_id: '2584',
			published: '1',
			product_name: 'Another kettle',
			mpn: 'mpn3828',
			product_codes: ['5052895380977'],
			summary_points: ['summary point 1', 'summary point 2'],
			description: 'some descriptive stuff here',
			brand_name: 'Igenix',
			default_image: 'http://myexamplesite.com/photos/p5052895380977.png',
			rrp: '24.99',
			product_data: [
				{
					label: 'label 1',
					value: 'value 1',
				},
				{
					label: 'label 2',
					value: 'value 2',
				},
			],
			listings: {
				new: {
					sku: 'sku9571',
					price: 39.99,
					stock: 3,
				},
			},
		},
	],
};

const pushProducts = async () => {
	await getToken();
	const products = await prepareData();
	const chunkSize = 500;
	const slicedArray = [];
	for (let i = 0; i < products.length; i += chunkSize) {
		const chunk = products.slice(i, i + chunkSize);
		const readyChunk = { site_id: 2000, products: chunk };
		slicedArray.push(readyChunk);
	}

	// await axios
	// 	.post('https://api.onbuy.com/v2/products', testData, {
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Authorization: token.access_token,
	// 		},
	// 	})
	// 	.then((res) => console.log(res.data))
	// 	.catch((error) => console.log(error.response.data));

	for (const arr of slicedArray) {
		await axios
			.post('https://api.onbuy.com/v2/products', arr, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: token.access_token,
				},
			})
			.then((res) => {
				console.log('dupa', res.data);
				// fs.writeFileSync(
				// 	`../generate/log_${Date.now()}`,
				// 	res.data.results,
				// 	'utf8'
				// );
			})
			.catch((error) => {
				console.log('dupa', error.response);
				// fs.writeFileSync(
				// 	`../generate/error_${Date.now()}`,
				// 	error.response.data,
				// 	'utf8'
				// )
			});
	}
};

pushProducts();
// const getCategories = async (offset) => {
// 	await getToken();
//
// 	const categories = [];
//
// 	// for (let i = 0; i <= 7580; i + 200) {
// 	await axios
// 		.get(
// 			`https://api.onbuy.com/v2/categories?site_id=2000&limit=100&offset=${offset}`,
// 			{
// 				headers: {
// 					Authorization: token.access_token,
// 				},
// 			}
// 		)
// 		.then((res) => categories.push(...res.data.results))
// 		.catch((error) => console.log(error.response.data));
//
// 	const csv = new ObjectsToCsv(categories);
// 	await csv.toDisk(`../generate/categories_${offset}.csv`, {
// 		delimiter: ';',
// 	});
// 	console.log(`categories_${offset}.csv zapisany.`);
// 	console.log(categories);
// };
