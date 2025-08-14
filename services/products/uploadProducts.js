import fs from 'fs';
import dotenv from 'dotenv';
import Product from '../../models/Product.js';
import { isToday } from 'date-fns';

dotenv.config({ path: '../.env' });

const filesPath = '../public/temp/data/';

export const uploadProducts = async (bar) => {
	return new Promise((resolve) => {
		(async () => {
			const existing = await Product.findOne({});
			if (isToday(existing?.updatedAt)) return resolve();

			const { processProducts } = await import('./controllers/processJsonData.js');
			const { pushProduct } = await import('./services/product/pushProduct.js');

			const files = fs.readdirSync(filesPath);
			const productsFiles = files.filter((file) => file.match(/product-\d*/g));
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
			bar.start(0, 0, {
				dane: 'Zapisano produkty do bazy',
				additionalData: '',
			});
			resolve();
		})();
	});
};
