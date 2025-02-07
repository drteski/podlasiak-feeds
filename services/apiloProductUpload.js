import axios from 'axios';
import { LocalStorage } from 'node-localstorage';
import { differenceInMilliseconds } from 'date-fns';
import PL from '../models/PL.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import probe from 'probe-image-size';

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
	console.log('Połączono');
});

const localStorage = new LocalStorage('./scratch/apilo');
const VALIDITY_TIMEOUT = 10 * 24 * 60 * 60 * 1000;

const creds = {
	podlasiak: {
		accountName: 'Podlasiak',
		authorization: '2892a29c-c760-5ca8-967e-397cba5288d3',
		client_id: 3,
		secret: '1789577d-9574-5e75-9b6e-72c0f1771d6d',
		endpoint: 'https://podlasiak.apilo.com',
	},
};

const getTokens = async (accountName) => {
	return new Promise(async (resolve, reject) => {
		await axios
			.post(
				`${creds[`${accountName.toLowerCase()}`].endpoint}/rest/auth/token/`,
				{
					grantType: 'authorization_code',
					token: creds[`${accountName.toLowerCase()}`].authorization,
					developerId: null,
				},
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					withCredentials: true,
					auth: {
						username:
							creds[`${accountName.toLowerCase()}`].client_id,
						password: creds[`${accountName.toLowerCase()}`].secret,
					},
				}
				// {}
			)
			.then((response) => {
				localStorage.setItem(
					`${accountName.toLowerCase()}ApiloTokens`,
					JSON.stringify(response.data)
				);
				resolve('Tokeny zapisane');
			})
			.catch((error) => reject(error.response.data));
	});
};
const getAccessToken = async (accountName, refreshToken) => {
	return new Promise(async (resolve, reject) => {
		await axios
			.post(
				`${creds[`${accountName.toLowerCase()}`].endpoint}/rest/auth/token/`,
				{
					grantType: 'refresh_token',
					token: refreshToken,
					developerId: null,
				},
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					withCredentials: true,
					auth: {
						username:
							creds[`${accountName.toLowerCase()}`].client_id,
						password: creds[`${accountName.toLowerCase()}`].secret,
					},
				}
			)
			.then((response) => {
				localStorage.setItem(
					`${accountName.toLowerCase()}ApiloTokens`,
					JSON.stringify(response.data)
				);
				resolve('Tokeny odświeżone');
			})
			.catch((error) => reject(error.response.data));
	});
};

const isAuthorized = async (accountName) => {
	return new Promise(async (resolve, reject) => {
		const tokens = JSON.parse(
			localStorage.getItem(`${accountName.toLowerCase()}ApiloTokens`)
		);

		if (tokens === null || tokens === undefined) resolve(false);

		const tokenRefreshTimeDifference = differenceInMilliseconds(
			new Date(tokens.refreshTokenExpireAt),
			new Date(Date.now())
		);

		if (tokenRefreshTimeDifference < VALIDITY_TIMEOUT) {
			await getAccessToken(accountName, tokens.refreshToken)
				.then(() => resolve(true))
				.catch((error) => reject(error));
		}

		resolve(true);
	});
};

const apiloRequest = async (method, url, accountName, data = null) => {
	const tokens = JSON.parse(
		localStorage.getItem(`${accountName.toLowerCase()}ApiloTokens`)
	);
	return axios({
		url: `${creds[`${accountName.toLowerCase()}`].endpoint}` + url,
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + tokens.accessToken,
		},
		params: {
			sku: 'BLU-00027',
		},

		data,
	})
		.then((response) => console.log(response.data))
		.catch((error) => console.log(error.response.data));
};
const getProduct = async (accountName, sku) => {
	const tokens = JSON.parse(
		localStorage.getItem(`${accountName.toLowerCase()}ApiloTokens`)
	);
	return axios
		.get(
			`${creds[`${accountName.toLowerCase()}`].endpoint}` +
				'/rest/api/warehouse/product/',
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + tokens.accessToken,
				},
				params: {
					sku,
				},
			}
		)
		.then((response) => response.data.products[0])
		.catch((error) => console.log(error, 'get'));
};
const updateProduct = async (accountName, data) => {
	const tokens = JSON.parse(
		localStorage.getItem(`${accountName.toLowerCase()}ApiloTokens`)
	);
	return axios
		.put(
			`${creds[`${accountName.toLowerCase()}`].endpoint}` +
				'/rest/api/warehouse/product/',
			[data],
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + tokens.accessToken,
				},
			}
		)
		.then((response) => response.data.products[0])
		.catch((error) => console.log(error, 'update'));
};
const createProduct = async (accountName, data) => {
	const tokens = JSON.parse(
		localStorage.getItem(`${accountName.toLowerCase()}ApiloTokens`)
	);
	return axios
		.post(
			`${creds[`${accountName.toLowerCase()}`].endpoint}` +
				'/rest/api/warehouse/product/',
			[data],
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + tokens.accessToken,
				},
			}
		)
		.then((response) => response.data.products[0])
		.catch((error) => console.log(error, 'create'));
};

const uploadImage = async (accountName, url) => {
	const tokens = JSON.parse(
		localStorage.getItem(`${accountName.toLowerCase()}ApiloTokens`)
	);
	const { data } = await axios.get(url, { responseType: 'stream' });
	const mimeType = await probe(url)
		.then((res) => res.mime)
		.catch((e) => {});
	return axios
		.post(
			`${creds[`${accountName.toLowerCase()}`].endpoint}` +
				'/rest/api/media/',
			data,
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': mimeType,
					Authorization: 'Bearer ' + tokens.accessToken,
				},
			}
		)
		.then((response) => response.data.uuid)
		.catch((error) => console.log(error));
};
const apiloClient = async (account) => {
	if (!account)
		return console.log('Podaj nazwę konta dla którego przesłać produkty');
	const auth = await isAuthorized(account)
		.then((res) => res)
		.catch((error) => console.log(error));
	if (!auth) {
		await getTokens(account);
		await apiloClient(account);
	}

	const products = await PL.find();

	for await (const product of [products[12]]) {
		const {
			sku,
			domain,
			ean,
			title,
			description,
			brand,
			stock,
			price,
			weight,
			attributes,
			media,
		} = product;
		if (sku === '') return;
		const imagesToUpload = media.map((img) =>
			uploadImage(account, img.url)
		);
		const areImagesUploaded = localStorage.getItem(sku);
		if (areImagesUploaded === null) {
			const uploadedImages = await Promise.all(imagesToUpload).then(
				(res) => res
			);
			localStorage.setItem(sku, JSON.stringify(uploadedImages));
		}
		const existInApilo = await getProduct(account, sku);

		if (!existInApilo) {
			await createProduct(account, {
				sku,
				ean,
				name: title,
				description,
				status: 1,
				tax: 23,
				quantity: parseInt(stock),
				priceWithTax: price,
				weight,
				images: JSON.parse(localStorage.getItem(sku)),
			}).then((res) => console.log(res));
		}
		await updateProduct(account, {
			id: existInApilo.id,
			sku,
			ean,
			name: title,
			description,
			quantity: 5,
			// quantity: parseInt(stock),
			priceWithTax: price,
			weight,
			images: JSON.parse(localStorage.getItem(sku)),
		}).then((res) => console.log(res));
	}
	// await uploadImage(
	// 	account,
	// 	'https://tutumi.pl/picture/fit-in/2000x2000/filters:quality(80)/629aed331fb8f1895092169820666883.jpg'
	// );
	// const apiloProduct = await getProduct(account, sku);
	// await updateProduct(account, apiloProduct.id, {
	// 	description,
	// 	sku,
	// 	id: parseInt(apiloProduct.id),
	// 	tax: 23,
	// 	status: '1',
	// 	quantity: 999,
	// 	priceWithTax: '289',
	// });

	mongoose.connection.close();
};

apiloClient('PODLASIAK');
