import { pushProduct } from './product/pushProduct.js';

export const pushToDb = async (bar, products) => {
	return new Promise(async (resolve) => {
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
