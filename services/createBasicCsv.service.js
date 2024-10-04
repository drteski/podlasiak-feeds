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

dotenv.config({ path: '../.env' });

const generateBasicCsv = async (lang) => {
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
			images: media.map((link) => link.url).join(';'),
			attributes: attributes
				.map((attribute) => `${attribute.name}: ${attribute.value}`)
				.join(';'),
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/basic_${lang}.csv`, { delimiter: ';' });
	console.log(`basic_${lang}.csv zapisany.`);
};

export default generateBasicCsv;
