import axios from 'axios';
import axiosRetry from 'axios-retry';
import dotenv from 'dotenv';
import { connectToGoogleSheets, getDataFromSheets } from '../utilities/googleSheets.js';
import mongoose from 'mongoose';
import Subiekt from '../models/Subiekt.js';
import Product from '../models/Product.js';
import { subiektIncludedGroups } from '../config/config.js';
import { titleWithVariantName } from './products/utils/titleWithVariantName.js';
axiosRetry(axios, { retries: 3 });

dotenv.config({ path: '../.env' });
const { BASELINKER_URL, BASELINKER_TOKEN, DATABASE_URL } = process.env;

mongoose.set('strictQuery', true);
await mongoose.connect(
	DATABASE_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 10000,
		// useNewUrlParser: true,
		// useUnifiedTopology: true,
		// serverSelectionTimeoutMS: 0,
		// socketTimeoutMS: 0,
		// connectTimeoutMS: 0,
		// heartbeatFrequencyMS: 2000,
	},
	(error) => {
		if (error) {
			console.log(error);
		}
	}
);
mongoose.connection.on('connection', () => console.log('Połączono z DB'));
mongoose.connection.on('error', (err) => console.log(err));

const inventory_id = 16304;
const default_warehouse = 'bl_22987';
const price_group = 12887;

// const productsDimensions = await connectToGoogleSheets('1uXVoUeXeZyb198Za88ERRaDX5KYr_tV_rgt1sFcrlCQ').then((document) => getDataFromSheets(document, 'WYMIARY').then((data) => data));

const excludedSkus = ['ACR-', 'HET-', 'KOC-', 'FIR-', 'DYP-', 'REC-', 'FIT-', 'TDYP-', 'LAZ-'];

const baselinkerClient = {
	request: async (method, requestData) => {
		return new Promise((resolve, reject) => {
			(async () => {
				await axios
					.post(
						BASELINKER_URL,
						{
							method,
							parameters: JSON.stringify(requestData),
						},
						{
							headers: {
								'X-BLToken': BASELINKER_TOKEN,
								'Content-Type': 'application/x-www-form-urlencoded',
							},
							maxBodyLength: Infinity,
						}
					)
					.then((res) => resolve(res.data))
					.catch((err) => reject(err));
			})();
		});
	},
	delay: (time) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	},
	getInventories: async () => {
		return await baselinkerClient.request('getInventories', {}).then((data) => data.inventories);
	},
	getInventoryWarehouses: async () => {
		return await baselinkerClient.request('getInventoryWarehouses', {}).then((data) => data.warehouses);
	},
	getInventoryProductsList: async ({
		inventory_id,
		filter_id = undefined,
		filter_category_id = undefined,
		filter_ean = undefined,
		filter_sku = undefined,
		filter_name = undefined,
		filter_price_from = undefined,
		filter_price_to = undefined,
		filter_stock_from = undefined,
		filter_stock_to = undefined,
		page = 1,
		filter_sort = 'ASC',
	}) => {
		return await baselinkerClient
			.request('getInventoryProductsList', {
				inventory_id,
				filter_id,
				filter_category_id,
				filter_ean,
				filter_sku,
				filter_name,
				filter_price_from,
				filter_price_to,
				filter_stock_from,
				filter_stock_to,
				page,
				filter_sort,
			})
			.then((data) => {
				return Object.values(data.products);
			});
	},
	getAllItems: async (cb, params) => {
		let items = [];
		let isFinished = false;
		for await (const key of Array.from(Array(99999).keys())) {
			if (isFinished) break;
			const data = await cb({ ...params, page: key + 1 });
			items.push(...data);
			if (data.length < 1000) isFinished = true;
			await baselinkerClient.delay(50);
		}
		return items;
	},
	getInventoryProductsData: async ({ inventory_id, products = [] }) => {
		if (products.length === 0) return console.log('Brak podanych id produktów z Baselinkera');
		return await baselinkerClient.request('getInventoryProductsData', { inventory_id, products }).then((data) => Object.values(data.products));
	},
	getInventoryProductsStock: async ({ inventory_id, page = 1 }) => {
		return await baselinkerClient.request('getInventoryProductsStock', { inventory_id, page }).then((data) => Object.values(data.products));
	},
	getInventoryProductsPrices: async ({ inventory_id, page = 1 }) => {
		return await baselinkerClient.request('getInventoryProductsPrices', { inventory_id, page }).then((data) => Object.values(data.products));
	},
	getInventoryManufacturers: async () => {
		return await baselinkerClient.request('getInventoryManufacturers', {}).then((data) => data.manufacturers);
	},
	addInventoryManufacturer: async (name) => {
		const manufacturers = await baselinkerClient.getInventoryManufacturers();
		const manufacturerExists = manufacturers.filter((manufacturer) => manufacturer.name.toLowerCase() === name.toLowerCase());
		if (manufacturerExists.length === 0) return await baselinkerClient.request('addInventoryManufacturer', { name }).then((data) => data);
		return manufacturerExists[0];
	},
	addInventoryProducts: async ({ inventory_id, warehouse, price_group, lang }) => {
		const subiektProducts = await Subiekt.find({
			$or: subiektIncludedGroups.map((group) => ({ group })),
			$nor: excludedSkus.map((excl) => ({ sku: { $regex: excl, $options: 'i' } })),
		});
		const productsToAdd = [];
		for await (const subiektProduct of subiektProducts) {
			const { sku, prices, availableStock } = subiektProduct;
			if (excludedSkus.some((excl) => sku.includes(excl))) continue;
			const storeProduct = await Product.findOne({ sku });
			if (!storeProduct) continue;
			if (storeProduct.title[0][lang].toLowerCase().includes('allegro') || storeProduct.title[0][lang].toLowerCase().includes('usunięcia')) continue;
			const baselinkerProduct = await baselinkerClient.getAllItems(baselinkerClient.getInventoryProductsList, { inventory_id, filter_sku: sku });
			if (baselinkerProduct.length >= 1) continue;
			const manufacturer = await baselinkerClient.addInventoryManufacturer(storeProduct.producer);
			const attrs = storeProduct.attributes[0][lang].length === undefined ? [storeProduct.attributes[0][lang]] : storeProduct.attributes[0][lang];
			console.log(sku);

			productsToAdd.push({
				inventory_id,
				product_id: baselinkerProduct[0]?.id,
				parent_id: undefined,
				is_bundle: false,
				ean: storeProduct.ean,
				ean_additional: undefined,
				sku: storeProduct.sku,
				tags: undefined,
				tax_rate: 23,
				weight: storeProduct.weight,
				height: undefined,
				width: undefined,
				length: undefined,
				average_cost: !prices.lastPrice ? undefined : prices.lastPrice,
				star: undefined,
				manufacturer_id: manufacturer.manufacturer_id,
				category_id: undefined,
				prices: { [`${price_group}`]: storeProduct.sellPrice[0][lang].price },
				stock: { [`${warehouse}`]: availableStock },
				locations: undefined,
				text_fields: {
					name: titleWithVariantName(storeProduct.title[0][lang], storeProduct.variantName[0][lang]),
					description: storeProduct.description[0][lang].Rea,
					extra_field_4597: `${storeProduct.id}`,
					extra_field_4598: `${storeProduct.variantId}`,
					features: attrs.reduce((acc, attribute) => ({ ...acc, [attribute.name]: attribute.value }), {}),
				},
				images: storeProduct.images.reduce((acc, image, index) => ({ ...acc, [index]: `url:https://lazienka-rea.com.pl/picture/${image}` }), {}),
				links: undefined,
			});
		}

		for await (const productToAdd of productsToAdd) {
			await baselinkerClient.request('addInventoryProduct', productToAdd).then(() => {});
			await baselinkerClient.delay(50);
		}
	},

	updateInventoryProductsStock: async ({ inventory_id, warehouse }) => {
		const subiektProducts = await Subiekt.find({
			$or: subiektIncludedGroups.map((group) => ({ group })),
			$nor: excludedSkus.map((excl) => ({ sku: { $regex: excl, $options: 'i' } })),
		});
		const productsToAdd = {};
		for await (const subiektProduct of subiektProducts) {
			const { sku } = subiektProduct;
			const baselinkerProduct = await baselinkerClient.getAllItems(baselinkerClient.getInventoryProductsList, { inventory_id, filter_sku: sku });
			if (baselinkerProduct.length >= 1) continue;
			if (baselinkerProduct[0]?.id === undefined) continue;
			productsToAdd[`${baselinkerProduct[0]?.id}`] = { [`${warehouse}`]: subiektProduct.availableStock };
		}
		await baselinkerClient.request('updateInventoryProductsStock', { inventory_id, products: productsToAdd }).then(() => {
			console.log('stany');
		});
	},
	updateInventoryProductsPrices: async ({ inventory_id, price_group, lang }) => {
		const subiektProducts = await Subiekt.find({
			$or: subiektIncludedGroups.map((group) => ({ group })),
			$nor: excludedSkus.map((excl) => ({ sku: { $regex: excl, $options: 'i' } })),
		});

		const productsToAdd = {};
		for await (const subiektProduct of subiektProducts) {
			const { sku } = subiektProduct;
			if (excludedSkus.some((excl) => sku.includes(excl))) continue;
			const storeProduct = await Product.findOne({ sku });
			if (!storeProduct) continue;
			const baselinkerProduct = await baselinkerClient.getAllItems(baselinkerClient.getInventoryProductsList, { inventory_id, filter_sku: sku });
			if (baselinkerProduct.length >= 1) continue;
			if (baselinkerProduct[0]?.id === undefined) continue;
			productsToAdd[`${baselinkerProduct[0]?.id}`] = { [`${price_group}`]: storeProduct.sellPrice[0][lang].price };
		}
		await baselinkerClient.request('updateInventoryProductsPrices', { inventory_id, products: productsToAdd }).then(() => {
			console.log('ceny');
		});
	},
};

// await baselinkerClient.addInventoryProducts({ inventory_id, warehouse: default_warehouse, price_group, lang: 'el' });
await baselinkerClient.updateInventoryProductsStock({ inventory_id, warehouse: default_warehouse });
await baselinkerClient.updateInventoryProductsPrices({ inventory_id, price_group, lang: 'el' });
