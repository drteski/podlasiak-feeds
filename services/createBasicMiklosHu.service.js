import HU from '../models/HU.js';
import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateBasicMiklosHu = async (lng) => {
	const products = await HU.find();

	if (products === null) return;
	const productFeed = [];

	products.forEach((product) => {
		const {
			id,
			variantId,
			sku,
			ean,
			title,
			description,
			category,
			url,
			brand,
			stock,
			price,
			weight,
			attributes,
			media,
		} = product;
		if (brand !== 'Rea') return;

		productFeed.push({
			id,
			variantId,
			sku,
			ean,
			title,
			description,
			category,
			brand,
			url,
			price,
			stock,
			weight,
			images: media.map((link) => link.url).join(';'),
			attributes: attributes
				.map((attribute) => `${attribute.name}: ${attribute.value}`)
				.join(';'),
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/basic_miklos_hu.csv`, {
		delimiter: ';',
	});
	console.log(`basic_miklos_hu.csv zapisany.`);
};

export default generateBasicMiklosHu;
