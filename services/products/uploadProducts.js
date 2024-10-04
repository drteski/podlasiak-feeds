import { processProducts } from './controllers/processJsonData.js';
import fs from 'fs';
import { pushProduct } from './services/product/pushProduct.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const filesPath = '../public/temp/data/';

export const uploadProducts = async (bar) => {
	return new Promise(async (resolve) => {
		const files = fs.readdirSync(filesPath);
		const productsFiles = files.filter((file) =>
			file.match(/product-\d*/g)
		);
		if (productsFiles.length === 0) {
			return resolve();
		}

		bar.start(productsFiles.length, 0, {
			dane: 'Przetwarzanie plików',
			additionalData: '',
		});

		const products = [];
		for await (const [index, file] of productsFiles.entries()) {
			bar.update(index + 1);
			products.push(...processProducts(file, index));
		}
		bar.start(products.length, 0, {
			dane: 'Zapisywanie produktów do bazy',
			additionalData: ` 0/${products.length} •`,
		});
		for await (const [index, product] of products.entries()) {
			bar.update(index + 1, {
				dane: 'Zapisywanie produktów do bazy',
				additionalData: ` ${index + 1}/${products.length} •`,
			});
			await pushProduct(product);
		}
		resolve();
	});
};

export const getProductsFromFiles = async (bar) => {
	return new Promise(async (resolve) => {
		const files = fs.readdirSync(filesPath);
		const productsFiles = files.filter((file) =>
			file.match(/product-\d*/g)
		);

		if (productsFiles.length === 0) return resolve();

		bar.start(productsFiles.length, 0, {
			dane: 'Przetwarzanie plików',
			additionalData: '',
		});
		const products = [];
		for await (const [index, file] of productsFiles.entries()) {
			bar.update(index + 1);
			products.push(...processProducts(file, index));
		}
		resolve(products);
	});
};
