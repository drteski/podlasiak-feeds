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
import mongoose from 'mongoose';

dotenv.config({ path: '../.env' });

const generateJanekUpdateCsv = async (lang) => {
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
		default:
			console.error('brak bazy dla danego języka');
			products = [];
			break;
	}
	if (products === null) return;
	const productsPrepared = [];
	const productsTutumi = [];
	const productsRea = [];
	const productsToolight = [];

	const excluded = [
		'REA-U9887',
		'REA-U6647',
		'REA-U4663',
		'REA-U5685',
		'REA-U0267',
		'REA-U8907',
		'REA-U8000',
		'REA-U6963',
		'REA-U0539',
		'REA-U5067',
		'REA-U5611',
		'REA-U5603',
		'REA-U6334',
		'REA-U6593',
		'REA-U6932',
		'REA-U5692',
		'REA-U6933',
		'REA-B8821',
		'REA-U3401',
		'REA-U1021',
		'REA-U6649',
		'HOM-02827',
		'HOM-02823',
		'HOM-02835',
		'HOM-02826',
		'HOM-02829',
		'HOM-02822',
		'HOM-02801',
		'HOM-02829',
		'HOM-02835',
		'HOM-02836',
		'HOM-02837',
		'HOM-02824',
		'HOM-02823',
		'HOM-02820',
		'HOM-02826',
		'HOM-02827',
	];

	// const included = [
	// 	'NAZ-08936',
	// 	'NAZ-08802',
	// 	'NAZ-08800',
	// 	'NAZ-08801',
	// 	'NAZ-06614',
	// 	'NAZ-06612',
	// 	'NAZ-06610',
	// 	'NAZ-12309',
	// 	'NAZ-12315',
	// 	'NAZ-12310',
	// 	'NAZ-12308',
	// 	'NAZ-12300',
	// 	'NAZ-12316',
	// 	'NAZ-06613',
	// 	'NAZ-12305',
	// 	'NAZ-06655',
	// 	'NAZ-06656',
	// 	'NAZ-06615',
	// 	'NAZ-06658',
	// 	'NAZ-06611',
	// 	'NAZ-06654',
	// 	'NAZ-06657',
	// 	'NAZ-12302',
	// 	'NAZ-12306',
	// 	'NAZ-12313',
	// 	'NAZ-12312',
	// 	'NAZ-04033',
	// 	'NAZ-08528',
	// 	'NAZ-04030',
	// 	'NAZ-12320',
	// 	'NAZ-12322',
	// 	'NAZ-12314',
	// 	'NAZ-12301',
	// 	'NAZ-12331',
	// 	'NAZ-12317',
	// 	'NAZ-12330',
	// 	'NAZ-12328',
	// 	'NAZ-12329',
	// 	'NAZ-12327',
	// 	'NAZ-12323',
	// 	'NAZ-12325',
	// 	'NAZ-67000',
	// 	'NAZ-67001',
	// 	'NAZ-67002',
	// 	'NAZ-67006',
	// 	'NAZ-67003',
	// 	'SZL-05015',
	// 	'SZL-10035',
	// 	'SZL-05016',
	// 	'SZL-10036',
	// 	'SZL-05050',
	// 	'SZL-08802',
	// 	'SZL-05698',
	// 	'SZL-00458',
	// 	'SZL-00366',
	// 	'SZL-00002',
	// 	'SZL-06902',
	// 	'SZL-08803',
	// 	'SZL-03217',
	// 	'SZL-06935',
	// 	'SZL-03221',
	// 	'SZL-06956',
	// 	'SZL-05058',
	// 	'SZL-05057',
	// 	'SZL-06934',
	// 	'SZL-00006',
	// 	'SZL-06957',
	// 	'SZL-03214',
	// 	'SZL-08810',
	// 	'SZL-06960',
	// 	'SZL-88001',
	// 	'SZL-03215',
	// 	'SZL-06944',
	// 	'SZL-08811',
	// 	'SZL-00456',
	// 	'SZL-00005',
	// 	'SZL-08804',
	// 	'SZL-06940',
	// 	'SZL-06588',
	// 	'SZL-00362',
	// 	'SZL-00364',
	// 	'SZL-05699',
	// 	'SZL-06961',
	// 	'SZL-03652',
	// 	'SZL-06589',
	// 	'SZL-05052',
	// 	'SZL-00035',
	// 	'SZL-08806',
	// 	'SZL-00363',
	// 	'SZL-88000',
	// 	'SZL-03654',
	// 	'SZL-00081',
	// 	'SZL-08807',
	// 	'SZL-00003',
	// 	'SZL-00457',
	// 	'SZL-05602',
	// 	'SZL-03651',
	// 	'SZL-04003',
	// 	'SZL-05055',
	// 	'SZL-06941',
	// 	'SZL-00369',
	// 	'SZL-00459',
	// 	'SZL-10031',
	// 	'SZL-00007',
	// 	'SZL-00370',
	// 	'SZL-05053',
	// 	'SZL-09842',
	// 	'SZL-00034',
	// 	'SZL-04001',
	// 	'SZL-00460',
	// 	'SZL-06903',
	// 	'SZL-03216',
	// 	'SZL-05011',
	// 	'SZL-03220',
	// 	'SZL-05694',
	// 	'SZL-05056',
	// 	'SZL-06943',
	// 	'SZL-03655',
	// 	'SZL-00611',
	// 	'SZL-04002',
	// 	'SZL-00462',
	// 	'SZL-00704',
	// 	'SZL-00365',
	// 	'SZL-06587',
	// 	'SZL-03218',
	// 	'SZL-00700',
	// 	'SZL-00367',
	// 	'KID-05005',
	// 	'KID-05001',
	// 	'KID-05003',
	// 	'KID-05002',
	// 	'KID-05000',
	// 	'NAZ-12331',
	// 	'NAZ-12330',
	// 	'NAZ-12328',
	// 	'NAZ-12329',
	// 	'NAZ-12327',
	// 	'NAZ-12325',
	// 	'NAZ-67000',
	// 	'NAZ-67001',
	// 	'NAZ-67002',
	// 	'NAZ-67006',
	// 	'NAZ-67003',
	// 	'NAZ-67005',
	// 	'NAZ-67007',
	// 	'NAZ-67004',
	// 	'NAZ-12332',
	// ];

	const noStock = [
		'REA-G8903',
		'REA-G8028',
		'REA-G8029',
		'REA-G0988',
		'REA-G0989',
		'REA-G8027',
		'REA-G8905',
		'REA-G8906',
		'REA-G8907',
		'REA-G8908',
		'REA-G8909',
		'REA-G0900',
		'REA-G0901',
		'REA-G0902',
		'REA-G0903',
		'REA-G5600',
		'REA-G5601',
		'REA-G8404',
		'REA-G8900',
		'REA-G8901',
		'REA-G8902',
		'REA-G0091',
		'REA-G0092',
		'REA-G5698',
		'REA-G6992',
		'REA-G5692',
		'REA-G5603',
		'REA-G5604',
		'REA-G5605',
		'REA-G7003',
		'REA-G5610',
		'REA-G5611',
		'REA-G5612',
		'REA-G9800',
		'REA-G9801',
		'REA-G9802',
		'REA-G9803',
		'REA-G9804',
		'REA-G9805',
		'HOM-02827',
	];

	products.forEach((product) => {
		const { domain, brand, sku, stock, price } = product;
		const isNoStock = noStock.some((no) => no === sku);
		if (excluded.some((prod) => prod === sku)) return;
		productsPrepared.push({
			brand: !brand ? domain : brand,
			sku,
			stock,
			price,
			isNoStock,
		});
	});

	productsPrepared
		.reduce((previousValue, currentValue) => {
			if (
				previousValue.findIndex(
					(val) => val.sku === currentValue.sku
				) !== -1
			)
				return [...previousValue];
			return [...previousValue, currentValue];
		}, [])
		.forEach((product) => {
			const { brand, sku, stock, price, isNoStock } = product;

			if (brand === 'Rea') {
				productsRea.push({
					Command: 'UPDATE',
					'Variant SKU': sku,
					'Variant Inventory Qty': isNoStock
						? 0
						: stock < 5
							? 0
							: stock,
					'Variant Price': price,
					'Variant Compare At Price': price,
				});
			}
			if (brand === 'Tutumi') {
				productsTutumi.push({
					Command: 'UPDATE',
					'Variant SKU': sku,
					'Variant Inventory Qty': isNoStock ? 0 : stock,
					'Variant Price': price,
					'Variant Compare At Price': price,
				});
			}

			if (brand === 'Toolight' || brand === 'toolight') {
				productsToolight.push({
					Command: 'UPDATE',
					'Variant SKU': sku,
					'Variant Inventory Qty': isNoStock ? 0 : stock,
					'Variant Price': price,
					'Variant Compare At Price': price,
				});
			}
		});

	const csvRea = new ObjectsToCsv(productsRea);
	const csvTutumi = new ObjectsToCsv(productsTutumi);
	const csvToolight = new ObjectsToCsv(productsToolight);
	await csvRea.toDisk(`../generate/feed/janek_update_${lang}_rea.csv`, {
		delimiter: ',',
	});
	await csvTutumi.toDisk(`../generate/feed/janek_update_${lang}_tutumi.csv`, {
		delimiter: ',',
	});
	await csvToolight.toDisk(
		`../generate/feed/janek_update_${lang}_toolight.csv`,
		{
			delimiter: ',',
		}
	);
	console.log(`janek_update_${lang}.csv zapisany.`);
};

export default generateJanekUpdateCsv;

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
// generateJanekUpdateCsv('pl');
