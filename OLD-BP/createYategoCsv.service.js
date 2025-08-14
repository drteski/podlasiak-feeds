import DE from '../models/DE.js';
import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateYategoCsv = async () => {
	let products = await DE.find();

	if (products === null) return;
	const productFeed = [];

	products
		.reduce((previousVal, currentVal) => {
			if (
				previousVal.findIndex(
					(prev) => prev.variantId === currentVal.variantId
				) === -1
			)
				return [...previousVal, currentVal];
			return [...previousVal];
		}, [])
		.forEach((product) => {
			const {
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
				media,
			} = product;

			productFeed.push({
				foreign_id: variantId,
				article_nr: sku,
				title,
				tax: 19,
				price,
				price_uvp: '',
				price_purchase: '',
				tax_differential: '',
				units: '',
				delivery_surcharge: '',
				delivery_calc_once: '',
				short_desc: description,
				long_desc: description,
				url,
				auto_linefeet: '',
				picture: media.length > 1 ? media[0].url : '',
				picture2: media.length > 2 ? media[1].url : '',
				picture3: media.length > 3 ? media[2].url : '',
				picture4: media.length > 4 ? media[3].url : '',
				picture5: media.length > 5 ? media[4].url : '',
				categories: category.join(' > '),
				variants: '',
				discount_set_id: '',
				stock,
				delivery_date: '2-4 Tage',
				quantity_unit: '',
				package_size: '',
				ean,
				isbn: '',
				manufacturer: !brand ? domain : brand,
				mpn: '',
				delitem: '',
				status: '',
				top_offer: '',
			});
		});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/yatego.csv`, { delimiter: ';' });
	console.log(`yatego.csv zapisany.`);
};

export default generateYategoCsv;

// import mongoose from 'mongoose';
//
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
//
// generateYategoCsv();
