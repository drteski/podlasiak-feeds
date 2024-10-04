import DE from '../models/DE.js';
import EN from '../models/EN.js';
import ES from '../models/ES.js';
import FR from '../models/FR.js';
import IT from '../models/IT.js';
import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateIdealoFeed = async (lang) => {
	let products;
	let deliveryTime;
	switch (lang) {
		case 'de':
			products = await DE.find();
			deliveryTime = 'Lieferung in 3-5 Tagen';
			break;
		case 'en':
			products = await EN.find();
			deliveryTime = 'Delivery in 3-5 days';
			break;
		case 'es':
			products = await ES.find();
			deliveryTime = 'Entrega en 3-5 días';
			break;
		case 'fr':
			products = await FR.find();
			deliveryTime = 'Livraison en 3-5 jours';
			break;
		case 'it':
			products = await IT.find();
			deliveryTime = 'Consegna in 3-5 giorni';
			break;
		default:
			console.error(`Pomijam - ${lang}`);
			return;
	}
	if (products === null) return;
	const productFeed = [];

	products.forEach((product) => {
		const {
			domain,
			sku,
			ean,
			title,
			description,
			category,
			url,
			brand,
			price,
			media,
		} = product;
		if (domain !== 'Rea') return;
		productFeed.push({
			sku,
			brand,
			title,
			categoryPath: category.join(' > '),
			url: url + '?utm_source=idealo&utm_medium=cpc',
			eans: ean,
			description,
			price: price + '.00',
			paymentCosts_paypal: '0.00',
			deliveryCosts_dhl: '0.00',
			deliveryTime,
			imageUrls: media.map((link) => link.url).join(','),
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/idealo_${lang}.csv`, { delimiter: ',' });
	console.log(`idealo_${lang}.csv zapisany.`);
};

export default generateIdealoFeed;
