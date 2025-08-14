import EN from '../models/EN.js';
import NL from '../models/NL.js';
import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateBasicMiklosNl = async () => {
	const productsEn = await EN.find();
	const productsNl = await NL.find();

	if (productsEn === null || productsNl === null) return;
	const productFeed = [];

	productsEn.forEach((productEn) => {
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
			weight,
			attributes,
			media,
		} = productEn;

		if (brand !== 'Rea') return;

		const getPrice = productsNl.filter((productNl) => {
			if (variantId === productNl.variantId) return productNl;
		});
		let price;
		if (getPrice.length === 0) {
			price = 0;
		} else {
			price = getPrice[0].price;
		}
		productFeed.push({
			id,
			variantId,
			sku,
			ean,
			title,
			description,
			category: category[category.length - 1],
			brand,
			price,
			url,
			stock,
			weight,
			images: media.map((link) => link.url).join(';'),
			attributes: attributes
				.map((attribute) => `${attribute.name}: ${attribute.value}`)
				.join(';'),
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/basic_miklos_nl.csv`, {
		delimiter: ';',
	});
	console.log(`basic_miklos_nl.csv zapisany.`);
};

export default generateBasicMiklosNl;
