import dotenv from 'dotenv';
import EN from '../models/UA.js';
// import mongoose from 'mongoose';

dotenv.config({ path: '../.env' });

// mongoose.set('strictQuery', true);
// mongoose.connect(process.env.DATABASE_URL, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	serverSelectionTimeoutMS: 10000,
// });
// const db = mongoose.connection;
// db.on('error', (err) => console.log(err));
// db.once('open', () => {
// 	console.log('Połączono z DB');
// });

const uploader = {
	async getToken() {
		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
		myHeaders.append('Cookie', 'PHPSESSID=bmmjv12ctah2tofet65adb7kb1');

		const urlencoded = new URLSearchParams();
		urlencoded.append(
			'secret_key',
			'sk_test_d7b853c2390746ceb226215106dd01a4'
		);
		urlencoded.append(
			'consumer_key',
			'ck_test_0fbd8c189ef145f1b2eb96091936e02c'
		);
		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow',
		};
		return fetch(
			'https://api.onbuy.com/v2/auth/request-token',
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => result.access_token)
			.catch((error) => console.log('error', error));
	},
	async prepareData() {
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
				url,
				ean,
				media,
				attributes,
				price,
				sku,
				category,
			} = product;
			if (domain !== 'Rea') return;
			const specs = () => {
				const joinedSpec = attributes
					.map((spec, index) => {
						if (index === 0) return;
						return `<li>${spec.name}: ${spec.value}</li>`;
					})
					.join('');

				return `<ul>${joinedSpec}</ul>`;
			};
			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return { url, main };
			});
			const filteredAttrs = attributes.map((attribute) => {
				const { name, value } = attribute;
				return { name, value };
			});

			data.push({
				id: variantId,
				name: title,
				description,
				link: url,
				brand,
				quantity: stock,
				fileUnder: category[category.length - 1],
				stock: stock > 0 ? 'in stock' : 'out of stock',
				ean: !ean ? '' : ean,
				price,
				images: filteredMedia,
				productCode: sku,
				specifications: specs(),
				attributes: filteredAttrs,
			});
		});

		return data;
	},
	testData: {
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
				default_image:
					'http://myexamplesite.com/photos/p5079735805360.png',
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
				default_image:
					'http://myexamplesite.com/photos/p5052895380977.png',
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
	},
	async pushProduct() {
		const token = await this.getToken();
		console.log(token);
		const myHeaders = new Headers();
		myHeaders.append(
			'Authorization',
			'3A5A4EE5-DCEF-4A15-8FF6-B2AB7C2C88C5'
		);
		myHeaders.append('Content-Type', 'application/json');
		myHeaders.append('Cookie', 'PHPSESSID=bmmjv12ctah2tofet65adb7kb1');

		const raw = JSON.stringify(this.testData);
		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
			redirect: 'follow',
		};

		fetch('https://api.onbuy.com/v2/products', requestOptions)
			.then((response) => response.json())
			.then((result) => console.log(result))
			.catch((error) => console.log('error', error));
	},
};

uploader.pushProduct();
