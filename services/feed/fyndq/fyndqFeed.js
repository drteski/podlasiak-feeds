import axios from 'axios';
import util from 'util';
import { connectToGoogleSheets, getDataFromSheets } from '../../../utilities/googleSheets.js';
import { productsChunker } from './../../processFeed.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
const getProductsData = () => {
	return new Promise(async (resolve, reject) => {
		const products = await Promise.all(
			Array.from(Array(100).keys()).map((page) => {
				return axios
					.get(`https://merchants-api.fyndiq.se/api/v1/articles?limit=1000&page=${page + 1}`, {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic {${Buffer.from('759bd092-1546-4a08-9cd8-fc4c2c43723b:78f3dd86-8f41-48db-a948-076e5a2bb87d').toString('base64')}}`,
						},
					})
					.then((res) => res.data)
					.catch((error) => reject());
			})
		);
		resolve(
			products
				.flatMap((product) => product)
				.map((product) => ({ sku: product.sku, id: product.id }))
				.filter(Boolean)
		);
	});
};

const getCdonData = (data) => {
	return new Promise(async (resolve, reject) => {
		const cdon = await connectToGoogleSheets('1KY8oPlIqkJN5oXuPe5ndYePYN1zsybMLgQdlfOwJ1Ro')
			.then((document) => getDataFromSheets(document, 'feed CDON').then((data) => data))
			.catch((error) => reject());
		resolve({ cdon, products: data });
	});
};

const checkExistingProducts = (data) => {
	return new Promise(async (resolve) => {
		resolve(
			data.products
				.map((product) => {
					const existingPrice = data.cdon.filter((price) => price.sku.toLowerCase() === product.sku.toLowerCase());
					if (existingPrice.length !== 0) return { ...product, ...existingPrice[0] };
					return null;
				})
				.filter(Boolean)
		);
	});
};

const pushNewProducts = (data) => {
	return new Promise(async (resolve, reject) => {
		const products = data.map((product) => ({
			sku: product.sku,
			status: 'for sale',
			quantity: parseInt(product.stock),
			categories: [product.category],
			brand: product.brand,
			gtin: product.gtin,
			main_image: product.mainImage,
			images: product.extraImages.split(';').slice(0, 9),
			markets: ['SE', 'DK', 'FI'],
			title: [
				{
					language: 'sv-SE',
					value: product.titleSe,
				},
				{
					language: 'da-DK',
					value: product.titleDk,
				},
				{
					language: 'fi-FI',
					value: product.titleFi,
				},
			],
			description: [
				{
					language: 'sv-SE',
					value: product.descriptionSe,
				},
				{
					language: 'da-DK',
					value: product.descriptionDk,
				},
				{
					language: 'fi-FI',
					value: product.descriptionFi,
				},
			],
			price: [
				{
					market: 'SE',
					value: {
						amount: parseFloat(product.salePriceSe) / (1 + parseFloat(product.vatSe) / 100),
						amount_including_vat: parseFloat(product.salePriceSe),
						currency: 'SEK',
						vat_rate: parseFloat(product.vatSe) / 100,
					},
				},
				{
					market: 'DK',
					value: {
						amount: parseFloat(product.salePriceDk) / (1 + parseFloat(product.vatDk) / 100),
						amount_including_vat: parseFloat(product.salePriceDk),
						currency: 'DKK',
						vat_rate: parseFloat(product.vatDk) / 100,
					},
				},
				{
					market: 'FI',
					value: {
						amount: parseFloat(product.originalPriceFi) / (1 + parseFloat(product.vatFi) / 100),
						amount_including_vat: parseFloat(product.originalPriceFi),
						currency: 'EUR',
						vat_rate: parseFloat(product.vatFi) / 100,
					},
				},
			],
			original_price: [
				{
					market: 'SE',
					value: {
						amount: parseFloat(product.originalPriceSe) / (1 + parseFloat(product.vatSe) / 100),
						amount_including_vat: parseFloat(product.originalPriceSe),
						currency: 'SEK',
						vat_rate: parseFloat(product.vatSe) / 100,
					},
				},
				{
					market: 'DK',
					value: {
						amount: parseFloat(product.originalPriceDk) / (1 + parseFloat(product.vatDk) / 100),
						amount_including_vat: parseFloat(product.originalPriceDk),
						currency: 'DKK',
						vat_rate: parseFloat(product.vatDk) / 100,
					},
				},
				{
					market: 'FI',
					value: {
						amount: parseFloat(product.originalPriceFi) / (1 + parseFloat(product.vatFi) / 100),
						amount_including_vat: parseFloat(product.originalPriceFi),
						currency: 'EUR',
						vat_rate: parseFloat(product.vatFi) / 100,
					},
				},
			],
			shipping_time: [
				{
					market: 'SE',
					min: 5,
					max: 7,
				},
				{
					market: 'DK',
					min: 5,
					max: 7,
				},
				{
					market: 'FI',
					min: 5,
					max: 7,
				},
			],
		}));

		const chunks = productsChunker(products, 100);
		chunks.map(async (chunk) => {
			await axios
				.post(`https://merchants-api.fyndiq.se/api/v1/articles/bulk`, chunk, {
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Basic {${Buffer.from('759bd092-1546-4a08-9cd8-fc4c2c43723b:78f3dd86-8f41-48db-a948-076e5a2bb87d').toString('base64')}}`,
					},
				})
				.then((res) => res.data)
				.catch((error) => reject());
		});
		resolve();
	});
};
const pushPricesAndStock = (data) => {
	return new Promise(async (resolve, reject) => {
		const products = data
			.map((product) => {
				return [
					{
						action: 'update_article',
						id: product.id,
						body: {
							sku: product.sku,
							status: 'for sale',
							main_image: product.mainImage,
							markets: ['SE', 'DK', 'FI'],
							categories: [product.category],
							title: [
								{ language: 'sv-SE', value: product.titleSe },
								{ language: 'da-DK', value: product.titleDk },
								{ language: 'fi-FI', value: product.titleFi },
							],
							description: [
								{
									language: 'sv-SE',
									value: product.descriptionSe,
								},
								{
									language: 'da-DK',
									value: product.descriptionDk,
								},
								{
									language: 'fi-FI',
									value: product.descriptionFi,
								},
							],
							shipping_time: [
								{
									market: 'SE',
									min: 5,
									max: 7,
								},
								{
									market: 'DK',
									min: 5,
									max: 7,
								},
								{
									market: 'FI',
									min: 5,
									max: 7,
								},
							],
						},
					},
					{
						action: 'update_article_price',
						id: product.id,
						body: {
							price: [
								{
									market: 'SE',
									value: {
										amount: parseFloat(product.salePriceSe),
										currency: 'SEK',
									},
								},
								{
									market: 'DK',
									value: {
										amount: parseFloat(product.salePriceDk),
										currency: 'DKK',
									},
								},
								{
									market: 'FI',
									value: {
										amount: parseFloat(product.originalPriceFi),
										currency: 'EUR',
									},
								},
							],
							original_price: [
								{
									market: 'SE',
									value: {
										amount: parseFloat(product.originalPriceSe),
										currency: 'SEK',
									},
								},
								{
									market: 'DK',
									value: {
										amount: parseFloat(product.originalPriceDk),
										currency: 'DKK',
									},
								},
								{
									market: 'FI',
									value: {
										amount: parseFloat(product.originalPriceFi),
										currency: 'EUR',
									},
								},
							],
						},
					},
					{
						action: 'update_article_quantity',
						id: product.id,
						body: {
							quantity: parseInt(product.stock),
						},
					},
				];
			})
			.flatMap((product) => product);

		const chunks = productsChunker(products, 200);
		chunks.map(async (chunk) => {
			await axios
				.put(`https://merchants-api.fyndiq.se/api/v1/articles/bulk`, chunk, {
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Basic {${Buffer.from('759bd092-1546-4a08-9cd8-fc4c2c43723b:78f3dd86-8f41-48db-a948-076e5a2bb87d').toString('base64')}}`,
					},
				})
				.then((res) => res.data)
				.catch((error) => reject());
		});
		resolve();
	});
};

export const generateFyndiqFeed = async (products, config) => {
	const shouldRun = await runFeedGenerator(config.name);
	if (!shouldRun) return;
	await getProductsData().then(
		async (data) =>
			await getCdonData(data)
				.then(async (data) => {
					await checkExistingProducts({
						products: data.cdon,
						cdon: data.products,
					}).then(async (data) => await pushPricesAndStock(data));
					return data.cdon;
				})
				.then(async (data) => await pushNewProducts(data))
	);
	await runFeedGenerator(config.name, true);
};
