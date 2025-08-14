import Product from '../../../../models/Product.js';
import { isToday } from 'date-fns';

export const pushProduct = async (product) => {
	const { id, active, variantId, activeVariant, sku, ean, weight, stock, producer, url, attributes, price, promoPrice, description, title, variantName, aliases, images, files, categories } =
		product;

	const existing = await Product.findOne({
		uid: `${id}${variantId}`,
	});
	if (isToday(existing?.updatedAt)) return;

	if (existing) {
		await Product.updateOne(
			{
				uid: existing.uid,
			},
			{
				uid: `${id}${variantId}`,
				id,
				active: active === 1,
				variantId,
				activeVariant: activeVariant === 1,
				sku,
				ean,
				weight,
				stock,
				producer,
				aliases,
				title,
				description,
				variantName,
				basePrice: price,
				sellPrice: promoPrice,
				images,
				files,
				category: categories,
				url,
				attributes,
				updatedAt: new Date(),
			}
		);
	} else {
		const newProduct = new Product({
			uid: `${id}${variantId}`,
			id,
			active: active === 1,
			variantId,
			activeVariant: activeVariant === 1,
			sku,
			ean,
			weight,
			stock,
			producer,
			aliases,
			title,
			description,
			variantName,
			basePrice: price,
			sellPrice: promoPrice,
			images,
			files,
			category: categories,
			url,
			attributes,
			updatedAt: new Date(),
		});
		await newProduct.save();
	}
};
