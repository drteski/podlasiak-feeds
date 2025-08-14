import ObjectsToCsv from 'objects-to-csv-file';
import PL from '../models/PL.js';
import DE from '../models/DE.js';
import FR from '../models/FR.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateAtomstoreCsv = async (lang) => {
	let products;
	switch (lang) {
		case 'de':
			products = await DE.find();
			break;
		case 'fr':
			products = await FR.find();
			break;
		case 'pl':
			products = await PL.find();
			break;
		default:
			console.error('brak bazy dla danego języka');
			products = [];
			break;
	}

	if (products === null) return;
	const productFeed = [];

	products.forEach((product) => {
		const {
			sku,
			ean,
			title,
			description,
			brand,
			stock,
			price,
			weight,
			media,
		} = product;
		let vat;
		switch (lang) {
			case 'de':
				vat = 19;
				break;
			case 'fr':
				vat = 21;
				break;
			case 'pl':
				vat = 23;
				break;
			default:
				console.error('brak bazy dla danego języka');
				vat = 23;
				break;
		}

		productFeed.push({
			active: stock > 0 ? 1 : 0,
			sku,
			ean,
			title,
			description,
			brand,
			weight,
			stock,
			price,
			vat,
			images: media.map((link) => link.url).join(';'),
		});
	});
	if (productFeed.length === 0) return;
	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/atomstore_${lang}.csv`, {
		delimiter: ';',
	});
	console.log(`atomstore_${lang}.csv zapisany.`);
};

export default generateAtomstoreCsv;
