import AT from '../models/AT.js';
import BE from '../models/BE.js';
import BG from '../models/BG.js';
import CZ from '../models/CZ.js';
import DE from '../models/DE.js';
import EE from '../models/EE.js';
import EN from '../models/EN.js';
import ES from '../models/ES.js';
import FR from '../models/FR.js';
import HR from '../models/HR.js';
import HU from '../models/HU.js';
import IE from '../models/IE.js';
import IT from '../models/IT.js';
import LT from '../models/LT.js';
import LV from '../models/LV.js';
import ME from '../models/ME.js';
import NL from '../models/NL.js';
import ObjectsToCsv from 'objects-to-csv-file';
import PL from '../models/PL.js';
import RO from '../models/RO.js';
import RS from '../models/RS.js';
import RU from '../models/RU.js';
import SI from '../models/SI.js';
import SK from '../models/SK.js';
import UA from '../models/UA.js';
import dotenv from 'dotenv';
import EL from '../models/EL.js';
import FI from '../models/FI.js';
import PT from '../models/PT.js';

// import mongoose from 'mongoose';

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
// 	console.log('Połączono');
// });

const generateWszystkoPL = async (lang) => {
	let products;
	switch (lang) {
		case 'at':
			products = await AT.find();
			break;
		case 'be':
			products = await BE.find();
			break;
		case 'bg':
			products = await BG.find();
			break;
		case 'cz':
			products = await CZ.find();
			break;
		case 'de':
			products = await DE.find();
			break;
		case 'ee':
			products = await EE.find();
			break;
		case 'en':
			products = await EN.find();
			break;
		case 'es':
			products = await ES.find();
			break;
		case 'fr':
			products = await FR.find();
			break;
		case 'hr':
			products = await HR.find();
			break;
		case 'hu':
			products = await HU.find();
			break;
		case 'ie':
			products = await IE.find();
			break;
		case 'it':
			products = await IT.find();
			break;
		case 'lt':
			products = await LT.find();
			break;
		case 'lv':
			products = await LV.find();
			break;
		case 'me':
			products = await ME.find();
			break;
		case 'nl':
			products = await NL.find();
			break;
		case 'pl':
			products = await PL.find();
			break;
		case 'ro':
			products = await RO.find();
			break;
		case 'rs':
			products = await RS.find();
			break;
		case 'ru':
			products = await RU.find();
			break;
		case 'si':
			products = await SI.find();
			break;
		case 'sk':
			products = await SK.find();
			break;
		case 'ua':
			products = await UA.find();
			break;
		case 'gr':
			products = await EL.find();
			break;
		case 'fi':
			products = await FI.find();
			break;
		case 'pt':
			products = await PT.find();
			break;
		default:
			console.error('brak bazy dla danego języka');
			products = [];
			break;
	}
	if (products === null) return;
	const productFeed = [];

	const sortedProducts = products.sort((a, b) => {
		return b.attributes.length - a.attributes.length;
	});

	const attributesList = sortedProducts
		.map((product) => {
			return product.attributes;
		})
		.flat()
		.map((redo) => {
			const { name, value } = redo;
			return { name, value };
		})
		.reduce((curr, acc) => {
			if (!curr.some((obj) => obj.name === acc.name)) {
				curr.push(acc);
			}
			return curr;
		}, []);

	const imagesList = sortedProducts
		.map((product) => {
			return product.media;
		})
		.sort((a, b) => b.length - a.length)
		.map((dupa) => dupa.length);
	const appendHeaders = (attrs, obj) => {
		attrs.forEach((attribute) => {
			obj[`${attribute.name}`] = '';
		});
	};

	const appendImages = (images, obj) => {
		Array.from(Array(images[0]).keys()).forEach((key) => {
			obj[`img_${key + 1}`] = '';
		});
	};

	const header = {
		domain: '',
		merce_id: '',
		merce_variant_id: '',
		sku: '',
		ean: '',
		title: '',
		description: '',
		brand: '',
		price: '',
		vat: '',
		stock: '',
		weight: '',
		url: '',
		images: '',
		attribute_list: '',
	};
	appendImages(imagesList, header);
	appendHeaders(attributesList, header);
	productFeed.push(header);

	sortedProducts.forEach((product) => {
		const {
			id,
			variantId,
			domain,
			sku,
			ean,
			title,
			url,
			description,
			brand,
			stock,
			price,
			weight,
			attributes,
			media,
		} = product;
		// const finalAttributes = (attrs) => {
		// 	return attrs
		// 		.map((attribute) => {
		// 			if (attribute.name === 'Wariant opcji') return;
		// 			if (attribute.name === 'Informacja o dostawie') return;
		// 			return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
		// 		})
		// 		.filter(Boolean)
		// 		.join('');
		// };

		// const finalMedia = (images) => {
		// 	return images.map((image) => {
		// 		return image.url;
		// 	});
		// };

		const appendAttributes = (attrs, obj) => {
			attrs.forEach((attribute) => {
				obj[`${attribute.name}`] = attribute.value;
			});
		};

		const appendImages = (images, obj) => {
			images.forEach((image, index) => {
				obj[`img_${index + 1}`] = image.url;
			});
		};

		const finalObject = {
			domain,
			merce_id: id,
			merce_variant_id: variantId,
			sku,
			ean,
			title,
			description,
			brand,
			price,
			vat: 23,
			stock,
			weight,
			url,
		};

		appendImages(media, finalObject);

		appendAttributes(attributes, finalObject);

		productFeed.push(finalObject);
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/wszystko_${lang}.csv`, {
		delimiter: ';',
	});
	console.log(`wszystko_${lang}.csv zapisany.`);
};

export default generateWszystkoPL;

// generateWszystkoPL('pl');
