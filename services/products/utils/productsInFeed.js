import Feeds from '../../../models/Feeds.js';

export const productsInFeed = async (name, products, language) => {
	const productsToSave = products.map((product) => product.variantId);
	const feed = await Feeds.findOne({ name });

	if (!feed) {
		const newFeed = new Feeds({
			name,
			updatedAt: new Date(2021, 0, 1, 0, 0, 0, 0),
		});
		await newFeed.save();
		return;
	}

	await Feeds.updateOne({ name }, { products: { ...feed.products, [language]: productsToSave } });
};

export const checkProductsInFeed = async (name, variantId, language) => {
	const feed = await Feeds.findOne({ name });

	if (!feed) {
		return false;
	}
	if (feed?.products?.[language] === undefined) return false;

	return feed.products[language].includes(variantId);
};
