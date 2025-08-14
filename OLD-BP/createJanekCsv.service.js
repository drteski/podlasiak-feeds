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

const generateJanekCsv = async (lang) => {
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
		'REA-U0154',
	];

	const productsPrepared = [];
	const productsTutumi = [];
	const productsRea = [];
	const productsToolight = [];

	products.forEach((product) => {
		const {
			domain,
			variantId,
			sku,
			ean,
			title,
			description,
			category,
			brand,
			stock,
			price,
			weight,
			attributes,
			media,
		} = product;
		if (excluded.some((prod) => prod === sku)) return;
		if (media.length === 0) return;
		const findClosest = (arr, num) => {
			if (arr == null) {
				return;
			}

			let closest = arr[0];
			for (const item of arr) {
				if (Math.abs(item - num) < Math.abs(closest - num)) {
					closest = item;
				}
			}
			return closest;
		};

		const attrs = attributes
			.map((attr) => {
				if (attr.name === 'Wariant opcji') return;
				return `<li><strong>${attr.name}:</strong> ${attr.value}</li>`;
			})
			.join('');

		const descriptionSplitter = () => {
			if (description.length === 0) return ['', ''];
			if (description.length <= 200) return [description, ''];
			const dotIndexes = [];
			description.split('').forEach((des, index) => {
				if (des !== '.') return;
				dotIndexes.push(index);
			});
			const half = Math.floor(description.length / 2);
			const firstPart = description.slice(
				0,
				dotIndexes[dotIndexes.indexOf(findClosest(dotIndexes, half))] +
					1
			);
			const secondPart = description.slice(
				dotIndexes[dotIndexes.indexOf(findClosest(dotIndexes, half))] +
					1,
				-1
			);
			return [firstPart, secondPart];
		};
		const splitedDescription = descriptionSplitter();
		let secondImage;
		let thirdImage;
		if (media.length === 1) {
			secondImage = `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${media[0].url} ' alt=''>`;
			thirdImage = ``;
		} else if (media.length === 2) {
			secondImage = `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${media[0].url} ' alt=''>`;
			thirdImage = `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${media[1].url} ' alt=''>`;
		} else if (media.length > 2) {
			secondImage = `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${media[1].url} ' alt=''>`;
			thirdImage = `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${media[2].url} ' alt=''>`;
		} else {
			secondImage = '';
			thirdImage = '';
		}

		productsPrepared.push({
			variantId,
			vendor: !brand ? domain : brand,
			title,
			type: category.join(' > '),
			published: 'TRUE',
			sku,
			weight: weight * 1000,
			stock,
			price: Math.ceil(price * 0.95),
			compareAtPrice: price,
			ean,
			media,
			description,
			details: `<ul style='list-style: none!important;'>${attrs}</ul>`,
			secondImage,
			thirdImage,
		});
	});
	productsPrepared
		.reduce((previousValue, currentValue) => {
			if (
				previousValue.findIndex(
					(val) => val.variantId === currentValue.variantId
				) !== -1
			)
				return [...previousValue];
			return [...previousValue, currentValue];
		}, [])
		.forEach((product) => {
			const {
				variantId,
				vendor,
				title,
				type,
				published,
				sku,
				weight,
				stock,
				price,
				compareAtPrice,
				ean,
				media,
				description,
				details,
				secondImage,
				thirdImage,
			} = product;

			if (vendor === 'Rea') {
				productsRea.push({
					Handle: variantId,
					Command: 'NEW',
					Vendor: vendor,
					Title: title,
					Type: type,
					Tags: '',
					Published: published,
					'Option1 Name': 'Title',
					'Option1 Value': '',
					'Option2 Name': '',
					'Option2 Value': '',
					'Option3 Name': '',
					'Option3 Value': '',
					'Variant SKU': sku,
					'Variant Grams': weight,
					'Variant Inventory Tracker': 'shopify',
					'Variant Inventory Qty': stock,
					'Variant Inventory Policy': 'deny',
					'Variant Fulfillment Service': 'manual',
					'Variant Price': price,
					'Variant Compare At Price': compareAtPrice,
					'Variant Requires Shipping': 'TRUE',
					'Variant Taxable': 'TRUE',
					'Variant Barcode': ean,
					'Image Src': media[0].url,
					'Image Command': 'MERGE',
					'Image Position': 1,
					'Image Alt Text': '',
					'SEO Title': title,
					'SEO Description': description,
					'Google Shopping / Google Product Category': '',
					'Google Shopping / Gender': '',
					'Google Shopping / Age Group': '',
					'Google Shopping / MPN': '',
					'Google Shopping / AdWords Grouping': '',
					'Google Shopping / AdWords Labels': '',
					'Google Shopping / Condition': '',
					'Google Shopping / Custom Product': '',
					'Google Shopping / Custom Label 0': '',
					'Google Shopping / Custom Label 1': '',
					'Google Shopping / Custom Label 2': '',
					'Google Shopping / Custom Label 3': '',
					'Google Shopping / Custom Label 4': '',
					'Variant Weight Unit': 'kg',
					'Variant Tax Code': '',
					'Cost per item': '',

					'Metafield: custom.product_details [single_line_text_field]':
						details,
					'Metafield: custom.second_image [single_line_text_field]':
						secondImage,
					'Metafield: custom.third_image [single_line_text_field]':
						thirdImage,
				});
				media.forEach((med, index) => {
					if (index === 0) return;
					return productsRea.push({
						Handle: variantId,
						Command: '',
						Vendor: '',
						Title: '',
						Type: '',
						Tags: '',
						Published: '',
						'Option1 Name': '',
						'Option1 Value': '',
						'Option2 Name': '',
						'Option2 Value': '',
						'Option3 Name': '',
						'Option3 Value': '',
						'Variant SKU': '',
						'Variant Grams': '',
						'Variant Inventory Tracker': '',
						'Variant Inventory Qty': '',
						'Variant Inventory Policy': '',
						'Variant Fulfillment Service': '',
						'Variant Price': '',
						'Variant Compare At Price': '',
						'Variant Requires Shipping': '',
						'Variant Taxable': '',
						'Variant Barcode': '',
						'Image Src': med.url,
						'Image Command': 'MERGE',
						'Image Position': index + 1,
						'Image Alt Text': '',
						'SEO Title': '',
						'SEO Description': '',
						'Google Shopping / Google Product Category': '',
						'Google Shopping / Gender': '',
						'Google Shopping / Age Group': '',
						'Google Shopping / MPN': '',
						'Google Shopping / AdWords Grouping': '',
						'Google Shopping / AdWords Labels': '',
						'Google Shopping / Condition': '',
						'Google Shopping / Custom Product': '',
						'Google Shopping / Custom Label 0': '',
						'Google Shopping / Custom Label 1': '',
						'Google Shopping / Custom Label 2': '',
						'Google Shopping / Custom Label 3': '',
						'Google Shopping / Custom Label 4': '',
						'Variant Weight Unit': '',
						'Variant Tax Code': '',
						'Cost per item': '',
						'Metafield: custom.product_details [single_line_text_field]':
							'',
						'Metafield: custom.second_image [single_line_text_field]':
							'',
						'Metafield: custom.third_image [single_line_text_field]':
							'',
					});
				});
			}
			if (vendor === 'Tutumi') {
				productsTutumi.push({
					Handle: variantId,
					Command: 'NEW',
					Vendor: vendor,
					Title: title,
					Type: type,
					Tags: '',
					Published: published,
					'Option1 Name': 'Title',
					'Option1 Value': '',
					'Option2 Name': '',
					'Option2 Value': '',
					'Option3 Name': '',
					'Option3 Value': '',
					'Variant SKU': sku,
					'Variant Grams': weight,
					'Variant Inventory Tracker': 'shopify',
					'Variant Inventory Qty': stock,
					'Variant Inventory Policy': 'deny',
					'Variant Fulfillment Service': 'manual',
					'Variant Price': price,
					'Variant Compare At Price': compareAtPrice,
					'Variant Requires Shipping': 'TRUE',
					'Variant Taxable': 'TRUE',
					'Variant Barcode': ean,
					'Image Src': media[0].url,
					'Image Command': 'MERGE',
					'Image Position': 1,
					'Image Alt Text': '',
					'SEO Title': title,
					'SEO Description': description,
					'Google Shopping / Google Product Category': '',
					'Google Shopping / Gender': '',
					'Google Shopping / Age Group': '',
					'Google Shopping / MPN': '',
					'Google Shopping / AdWords Grouping': '',
					'Google Shopping / AdWords Labels': '',
					'Google Shopping / Condition': '',
					'Google Shopping / Custom Product': '',
					'Google Shopping / Custom Label 0': '',
					'Google Shopping / Custom Label 1': '',
					'Google Shopping / Custom Label 2': '',
					'Google Shopping / Custom Label 3': '',
					'Google Shopping / Custom Label 4': '',
					'Variant Weight Unit': 'kg',
					'Variant Tax Code': '',
					'Cost per item': '',

					'Metafield: custom.product_details [single_line_text_field]':
						details,
					'Metafield: custom.second_image [single_line_text_field]':
						secondImage,
					'Metafield: custom.third_image [single_line_text_field]':
						thirdImage,
				});
				media.forEach((med, index) => {
					if (index === 0) return;
					return productsTutumi.push({
						Handle: variantId,
						Command: '',
						Vendor: '',
						Title: '',
						Type: '',
						Tags: '',
						Published: '',
						'Option1 Name': '',
						'Option1 Value': '',
						'Option2 Name': '',
						'Option2 Value': '',
						'Option3 Name': '',
						'Option3 Value': '',
						'Variant SKU': '',
						'Variant Grams': '',
						'Variant Inventory Tracker': '',
						'Variant Inventory Qty': '',
						'Variant Inventory Policy': '',
						'Variant Fulfillment Service': '',
						'Variant Price': '',
						'Variant Compare At Price': '',
						'Variant Requires Shipping': '',
						'Variant Taxable': '',
						'Variant Barcode': '',
						'Image Src': med.url,
						'Image Command': 'MERGE',
						'Image Position': index + 1,
						'Image Alt Text': '',
						'SEO Title': '',
						'SEO Description': '',
						'Google Shopping / Google Product Category': '',
						'Google Shopping / Gender': '',
						'Google Shopping / Age Group': '',
						'Google Shopping / MPN': '',
						'Google Shopping / AdWords Grouping': '',
						'Google Shopping / AdWords Labels': '',
						'Google Shopping / Condition': '',
						'Google Shopping / Custom Product': '',
						'Google Shopping / Custom Label 0': '',
						'Google Shopping / Custom Label 1': '',
						'Google Shopping / Custom Label 2': '',
						'Google Shopping / Custom Label 3': '',
						'Google Shopping / Custom Label 4': '',
						'Variant Weight Unit': '',
						'Variant Tax Code': '',
						'Cost per item': '',
						'Metafield: custom.product_details [single_line_text_field]':
							'',
						'Metafield: custom.second_image [single_line_text_field]':
							'',
						'Metafield: custom.third_image [single_line_text_field]':
							'',
					});
				});
			}
			if (vendor === 'Toolight' || vendor === 'toolight') {
				productsToolight.push({
					Handle: variantId,
					Command: 'NEW',
					Vendor: vendor,
					Title: title,
					Type: type,
					Tags: '',
					Published: published,
					'Option1 Name': 'Title',
					'Option1 Value': '',
					'Option2 Name': '',
					'Option2 Value': '',
					'Option3 Name': '',
					'Option3 Value': '',
					'Variant SKU': sku,
					'Variant Grams': weight,
					'Variant Inventory Tracker': 'shopify',
					'Variant Inventory Qty': stock,
					'Variant Inventory Policy': 'deny',
					'Variant Fulfillment Service': 'manual',
					'Variant Price': price,
					'Variant Compare At Price': compareAtPrice,
					'Variant Requires Shipping': 'TRUE',
					'Variant Taxable': 'TRUE',
					'Variant Barcode': ean,
					'Image Src': media[0].url,
					'Image Command': 'MERGE',
					'Image Position': 1,
					'Image Alt Text': '',
					'SEO Title': title,
					'SEO Description': description,
					'Google Shopping / Google Product Category': '',
					'Google Shopping / Gender': '',
					'Google Shopping / Age Group': '',
					'Google Shopping / MPN': '',
					'Google Shopping / AdWords Grouping': '',
					'Google Shopping / AdWords Labels': '',
					'Google Shopping / Condition': '',
					'Google Shopping / Custom Product': '',
					'Google Shopping / Custom Label 0': '',
					'Google Shopping / Custom Label 1': '',
					'Google Shopping / Custom Label 2': '',
					'Google Shopping / Custom Label 3': '',
					'Google Shopping / Custom Label 4': '',
					'Variant Weight Unit': 'kg',
					'Variant Tax Code': '',
					'Cost per item': '',

					'Metafield: custom.product_details [single_line_text_field]':
						details,
					'Metafield: custom.second_image [single_line_text_field]':
						secondImage,
					'Metafield: custom.third_image [single_line_text_field]':
						thirdImage,
				});
				media.forEach((med, index) => {
					if (index === 0) return;
					return productsToolight.push({
						Handle: variantId,
						Command: '',
						Vendor: '',
						Title: '',
						Type: '',
						Tags: '',
						Published: '',
						'Option1 Name': '',
						'Option1 Value': '',
						'Option2 Name': '',
						'Option2 Value': '',
						'Option3 Name': '',
						'Option3 Value': '',
						'Variant SKU': '',
						'Variant Grams': '',
						'Variant Inventory Tracker': '',
						'Variant Inventory Qty': '',
						'Variant Inventory Policy': '',
						'Variant Fulfillment Service': '',
						'Variant Price': '',
						'Variant Compare At Price': '',
						'Variant Requires Shipping': '',
						'Variant Taxable': '',
						'Variant Barcode': '',
						'Image Src': med.url,
						'Image Command': 'MERGE',
						'Image Position': index + 1,
						'Image Alt Text': '',
						'SEO Title': '',
						'SEO Description': '',
						'Google Shopping / Google Product Category': '',
						'Google Shopping / Gender': '',
						'Google Shopping / Age Group': '',
						'Google Shopping / MPN': '',
						'Google Shopping / AdWords Grouping': '',
						'Google Shopping / AdWords Labels': '',
						'Google Shopping / Condition': '',
						'Google Shopping / Custom Product': '',
						'Google Shopping / Custom Label 0': '',
						'Google Shopping / Custom Label 1': '',
						'Google Shopping / Custom Label 2': '',
						'Google Shopping / Custom Label 3': '',
						'Google Shopping / Custom Label 4': '',
						'Variant Weight Unit': '',
						'Variant Tax Code': '',
						'Cost per item': '',
						'Metafield: custom.product_details [single_line_text_field]':
							'',
						'Metafield: custom.second_image [single_line_text_field]':
							'',
						'Metafield: custom.third_image [single_line_text_field]':
							'',
					});
				});
			}
		});
	const csvRea = new ObjectsToCsv(productsRea);
	const csvTutumi = new ObjectsToCsv(productsTutumi);
	const csvToolight = new ObjectsToCsv(productsToolight);
	await csvRea.toDisk(`../generate/feed/janek_${lang}_rea.csv`, {
		delimiter: ',',
	});
	await csvTutumi.toDisk(`../generate/feed/janek_${lang}_tutumi.csv`, {
		delimiter: ',',
	});
	await csvToolight.toDisk(`../generate/feed/janek_${lang}_toolight.csv`, {
		delimiter: ',',
	});
	console.log(`janek_${lang}.csv zapisany.`);
};

export default generateJanekCsv;

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
// generateJanekCsv('pl');
