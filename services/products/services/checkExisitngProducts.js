import Product from '../../../models/Product.js';

export const checkExisitngProducts = async (bar, products) => {
	return new Promise(async (resolve) => {
		bar.start(products.length, 0, {
			dane: 'Sprawdzanie produktów w bazie',
			additionalData: ` 0/${products.length} •`,
		});
		const productsInDB = await Product.find({});

		const existingInFeedNotInDB = products.filter((product, index) => {
			const { id, variantId } = product;
			bar.update(index + 1);
			const existingIndex = productsInDB.findIndex(
				(db) => db.uid === parseInt(`${id}${variantId}`)
			);
			return existingIndex === -1;
		});
		const existingInDBNotInFeed = productsInDB.filter((db, index) => {
			const { uid } = db;
			bar.update(index + 1);
			const existingIndex = products.findIndex((product) => {
				const { id, variantId } = product;
				return uid === parseInt(`${id}${variantId}`);
			});
			return existingIndex === -1;
		});

		console.log(existingInFeedNotInDB.length, existingInDBNotInFeed.length);

		resolve(products);
	});
};
