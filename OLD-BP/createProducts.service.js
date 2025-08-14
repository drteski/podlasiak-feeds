// import xml2js from 'xml2js';
// import dotenv from 'dotenv';
// import axios from 'axios';
// import { replaceEntities } from './products/utils/replaceEntities.js';
// import getAttrs from '../utilities/getAttributes.utility.js';
// import getMedia from '../utilities/getMedia.utility.js';
// import generateUid from '../utilities/generateUid.utility.js';
//
// import PL from '../models/PL.js';
// import AT from '../models/AT.js';
// import BE from '../models/BE.js';
// import BG from '../models/BG.js';
// import CZ from '../models/CZ.js';
// import DE from '../models/DE.js';
// import EE from '../models/EE.js';
// import EN from '../models/EN.js';
// import ES from '../models/ES.js';
// import FR from '../models/FR.js';
// import HR from '../models/HR.js';
// import HU from '../models/HU.js';
// import IE from '../models/IE.js';
// import IT from '../models/IT.js';
// import LV from '../models/LV.js';
// import LT from '../models/LT.js';
// import ME from '../models/ME.js';
// import NL from '../models/NL.js';
// import RO from '../models/RO.js';
// import RS from '../models/RS.js';
// import RU from '../models/RU.js';
// import SI from '../models/SI.js';
// import SK from '../models/SK.js';
// import UA from '../models/UA.js';
// import EL from '../models/EL.js';
// import PT from '../models/PT.js';
// import FI from '../models/FI.js';
// import SE from '../models/SE.js';
// import DK from '../models/DK.js';
// import mongoose from 'mongoose';
// import cliProgress from 'cli-progress';
// import ansiColors from 'ansi-colors';
//
// dotenv.config({ path: '../.env' });
// axios.defaults;
//
// // mongoose.set('strictQuery', true);
// // mongoose.connect(process.env.DATABASE_URL, {
// // 	useNewUrlParser: true,
// // 	useUnifiedTopology: true,
// // 	serverSelectionTimeoutMS: 10000,
// // });
// // const db = mongoose.connection;
// //
// // db.on('error', (err) => console.log(err));
// // db.once('open', () => {});
//
// const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });
//
// const saveToDb = async (DB, item, variantId, domain, index, bar) => {
// 	try {
// 		const existing = await DB.findOne({
// 			variantId: `${variantId}`,
// 			domain: `${domain}`,
// 		});
// 		const uid = generateUid();
// 		if (existing === null) {
// 			const checkUid = await DB.findOne({
// 				uid: `${uid}`,
// 			});
// 			let prodToDb;
// 			if (checkUid === uid) {
// 				prodToDb = new DB({ uid: generateUid(), ...item });
// 			} else {
// 				prodToDb = new DB({ uid, ...item });
// 			}
// 			await prodToDb.save();
// 			bar.increment();
// 			bar.update(index + 1);
// 		} else {
// 			DB.updateOne(
// 				{
// 					uid: `${existing.uid}`,
// 					variantId: `${variantId}`,
// 					domain: `${domain}`,
// 				},
// 				{ uid: existing.uid, ...item },
// 				(err, docs) => {
// 					// console.log(`${existing.uid} - zaktualizowano`);
// 				}
// 			);
// 			bar.increment();
// 			bar.update(index + 1);
// 		}
// 	} catch (e) {
// 		console.error(e);
// 	}
// };
//
// const productsInFeed = async (data, domain) => {
// 	const products = [];
// 	for (const [index, product] of data.entries()) {
// 		const variantId = parseFloat(product.ATTR.variantId);
// 		products.push({ variantId, domain });
// 	}
// 	return products;
// };
//
// const clearNonExistingProductsInDb = async (db, data, domain) => {
// 	const existingProducts = await db.find({ domain });
// 	const filteredExistingProducts = existingProducts
// 		.map((prod) => prod.variantId)
// 		.filter((prod) => {
// 			const index = data.findIndex((dat) => dat.variantId === prod);
// 			if (index === -1) return prod;
// 		});
// 	for (const product of filteredExistingProducts) {
// 		await db.updateOne(
// 			{
// 				variantId: product,
// 				domain,
// 			},
// 			{ stock: 0 }
// 		);
// 	}
// 	console.log('');
// 	console.log(`Wyzerowano stany dla ${filteredExistingProducts.length} produtków`);
// };
//
// const clearNotExistingProducts = async (data, domain, lang) => {
// 	switch (lang) {
// 		case 'at':
// 			await clearNonExistingProductsInDb(AT, data, domain);
// 			break;
// 		case 'be':
// 			await clearNonExistingProductsInDb(BE, data, domain);
// 			break;
// 		case 'bg':
// 			await clearNonExistingProductsInDb(BG, data, domain);
// 			break;
// 		case 'cz':
// 			await clearNonExistingProductsInDb(CZ, data, domain);
// 			break;
// 		case 'de':
// 			await clearNonExistingProductsInDb(DE, data, domain);
// 			break;
// 		case 'ee':
// 			await clearNonExistingProductsInDb(EE, data, domain);
// 			break;
// 		case 'en':
// 			await clearNonExistingProductsInDb(EN, data, domain);
// 			break;
// 		case 'es':
// 			await clearNonExistingProductsInDb(ES, data, domain);
// 			break;
// 		case 'fr':
// 			await clearNonExistingProductsInDb(FR, data, domain);
// 			break;
// 		case 'hr':
// 			await clearNonExistingProductsInDb(HR, data, domain);
// 			break;
// 		case 'hu':
// 			await clearNonExistingProductsInDb(HU, data, domain);
// 			break;
// 		case 'ie':
// 			await clearNonExistingProductsInDb(IE, data, domain);
// 			break;
// 		case 'it':
// 			await clearNonExistingProductsInDb(IT, data, domain);
// 			break;
// 		case 'lt':
// 			await clearNonExistingProductsInDb(LT, data, domain);
// 			break;
// 		case 'lv':
// 			await clearNonExistingProductsInDb(LV, data, domain);
// 			break;
// 		case 'me':
// 			await clearNonExistingProductsInDb(ME, data, domain);
// 			break;
// 		case 'nl':
// 			await clearNonExistingProductsInDb(NL, data, domain);
// 			break;
// 		case 'pl':
// 			await clearNonExistingProductsInDb(PL, data, domain);
// 			break;
// 		case 'ro':
// 			await clearNonExistingProductsInDb(RO, data, domain);
// 			break;
// 		case 'rs':
// 			await clearNonExistingProductsInDb(RS, data, domain);
// 			break;
// 		case 'ru':
// 			await clearNonExistingProductsInDb(RU, data, domain);
// 			break;
// 		case 'si':
// 			await clearNonExistingProductsInDb(SI, data, domain);
// 			break;
// 		case 'sk':
// 			await clearNonExistingProductsInDb(SK, data, domain);
// 			break;
// 		case 'ua':
// 			await clearNonExistingProductsInDb(UA, data, domain);
// 			break;
// 		case 'gr':
// 			await clearNonExistingProductsInDb(EL, data, domain);
// 			break;
// 		case 'pt':
// 			await clearNonExistingProductsInDb(PT, data, domain);
// 			break;
// 		case 'fi':
// 			await clearNonExistingProductsInDb(FI, data, domain);
// 			break;
// 		case 'se':
// 			await clearNonExistingProductsInDb(SE, data, domain);
// 			break;
// 		case 'dk':
// 			await clearNonExistingProductsInDb(DK, data, domain);
// 			break;
// 		default:
// 			console.error('brak bazy dla danego języka');
// 			break;
// 	}
// };
//
// const xmlToDb = async (data, mediaData, lang, domain, index, bar) => {
// 	const id = parseFloat(data.ATTR.id);
// 	const variantId = parseFloat(data.ATTR.variantId);
// 	const sku = data.attrs[0].a[2]._;
// 	let ean;
// 	if (!isNaN(parseFloat(data.attrs[0].a[1]._))) {
// 		ean = parseFloat(data.attrs[0].a[1]._);
// 	} else {
// 		ean = null;
// 	}
// 	const title = data.name[0];
// 	const description = replaceEntities(data.desc[0]);
// 	let category;
// 	if (!data.cat || data.cat[0] === '') {
// 		category = ['---'];
// 	} else {
// 		const catSplit = data.cat[0].split(' > ');
// 		category = catSplit;
// 	}
// 	const { url } = data.ATTR;
// 	const brand = data.attrs[0].a[0]._;
// 	let stock;
// 	if (parseFloat(data.ATTR.stock) < 10) {
// 		stock = 0;
// 	} else {
// 		stock = parseFloat(data.ATTR.stock);
// 	}
// 	const price = data.ATTR.price === '' ? 0 : parseFloat(data.ATTR.price);
// 	const weight = parseFloat(data.ATTR.weight);
// 	const attributes = getAttrs(data);
// 	const media = await getMedia(mediaData);
// 	if (media.length === 0) return;
// 	const newProduct = {
// 		id,
// 		variantId,
// 		domain,
// 		sku,
// 		ean,
// 		title,
// 		description,
// 		category,
// 		url,
// 		brand,
// 		stock,
// 		price,
// 		weight,
// 		attributes,
// 		media,
// 	};
// 	switch (lang) {
// 		case 'at':
// 			await saveToDb(AT, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'be':
// 			await saveToDb(BE, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'bg':
// 			await saveToDb(BG, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'cz':
// 			await saveToDb(CZ, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'de':
// 			await saveToDb(DE, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'ee':
// 			await saveToDb(EE, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'en':
// 			await saveToDb(EN, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'es':
// 			await saveToDb(ES, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'fr':
// 			await saveToDb(FR, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'hr':
// 			await saveToDb(HR, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'hu':
// 			await saveToDb(HU, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'ie':
// 			await saveToDb(IE, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'it':
// 			await saveToDb(IT, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'lt':
// 			await saveToDb(LT, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'lv':
// 			await saveToDb(LV, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'me':
// 			await saveToDb(ME, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'nl':
// 			await saveToDb(NL, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'pl':
// 			await saveToDb(PL, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'ro':
// 			await saveToDb(RO, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'rs':
// 			await saveToDb(RS, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'ru':
// 			await saveToDb(RU, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'si':
// 			await saveToDb(SI, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'sk':
// 			await saveToDb(SK, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'ua':
// 			await saveToDb(UA, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'gr':
// 			await saveToDb(EL, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'pt':
// 			await saveToDb(PT, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'fi':
// 			await saveToDb(FI, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'se':
// 			await saveToDb(SE, newProduct, variantId, domain, index, bar);
// 			break;
// 		case 'dk':
// 			await saveToDb(DK, newProduct, variantId, domain, index, bar);
// 			break;
// 		default:
// 			console.error('brak bazy dla danego języka');
// 			break;
// 	}
// };
//
// const getXmlData = async (url, lang, domain) => {
// 	return new Promise(async (resolve, reject) => {
// 		const xml = await axios
// 			.get(url, {
// 				timeout: 0,
// 				responseType: 'text',
// 			})
// 			.then((res) => res.data)
// 			.catch((error) => {
// 				reject(`${error.name} ------- ${error.message}`);
// 			});
// 		if (!xml) {
// 			console.log('brak danych');
// 			return;
// 		}
//
// 		parserXML.parseString(xml, async (error, result) => {
// 			if (!result) return reject('brak danych');
// 			const parsedData = result.offers.o;
// 			const bar1 = new cliProgress.SingleBar({
// 				format: 'Zapisywanie: | ' + ansiColors.red('{bar}') + ' | {percentage}%  ||  {value}/{total}',
// 				barCompleteChar: '\u2588',
// 				barIncompleteChar: '\u2591',
// 				hideCursor: true,
// 			});
// 			bar1.start(parsedData.length, 0);
// 			if (error === null) {
// 				for await (const [index, data] of parsedData.entries()) {
// 					await xmlToDb(data, data.imgs[0], lang, domain, index, bar1);
// 				}
// 				const productFeed = await productsInFeed(parsedData, domain);
// 				await clearNotExistingProducts(productFeed, domain, lang);
// 			} else {
// 				console.log(error);
// 			}
// 			bar1.stop();
// 			resolve(`Zapisano - ${lang}`);
// 		});
// 	});
// };
// export default getXmlData;
