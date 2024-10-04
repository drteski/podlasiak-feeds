import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
import PL from '../models/PL.js';

dotenv.config({ path: '../.env' });
// mongoose.set('strictQuery', true);
// mongoose.connect(process.env.DATABASE_URL, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	serverSelectionTimeoutMS: 10000,
// });
// const db = mongoose.connection;
// db.on('error', (err) => console.log(err));
// db.once('open', () => {
// 	console.log('Połączono z DB');
// });

dotenv.config({ path: '../.env' });

const generateBasicCsv = async (lang) => {
	const products = await PL.find();

	if (products === null) return;
	const productFeed = [];

	products.forEach((product) => {
		const {
			id,
			variantId,
			domain,
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
		if (domain !== 'Toolight') return;

		const filteredAttributes = attributes
			.map((attribute) => {
				const { name, value } = attribute;
				if (name === 'Wariant opcji') return;
				if (name === 'Gwarancja') return;
				if (name === 'Informacja o dostawie') return;
				return { name, value };
			})
			.filter(Boolean);

		productFeed.push({
			domain,
			id,
			variantId,
			sku,
			ean,
			title,
			description,
			category: category.join(';'),
			brand,
			url,
			price,
			stock,
			weight,
			images: JSON.stringify(media.map((link) => link.url)),
			attributes: JSON.stringify(filteredAttributes),
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/toolight_${lang}.csv`, {
		delimiter: ';',
	});
	console.log(`toolight_${lang}.csv zapisany.`);
};

// generateBasicCsv('pl');
