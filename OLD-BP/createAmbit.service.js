import dotenv from 'dotenv';
import ObjectsToCsv from 'objects-to-csv-file';
import PL from '../models/PL.js';

dotenv.config({ path: '../.env' });

const generateAmbitCsv = async () => {
	const products = await PL.find();

	if (products === null) return;
	const productFeed = [];

	products.forEach((product) => {
		const { domain, sku, stock, price } = product;

		productFeed.push({
			domain,
			sku,
			price,
			stock,
			magId: 'M0',
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/ambit.csv`, { delimiter: ';' });
	console.log(`ambit.csv zapisany.`);
};

export default generateAmbitCsv;
