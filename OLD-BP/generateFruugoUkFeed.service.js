import fs from 'fs';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
import builder from 'xmlbuilder2';
import fruugoCategories from '../data/frugoCategories.js';
import IE from '../models/IE.js';
import ES from '../models/ES.js';
import EN from '../models/EN.js';

dotenv.config({ path: '../.env' });

const filterFrugo = [
	37817, 7336, 7338, 47126, 40373, 50440, 14188, 42741, 37789, 48228, 46074,
	43004, 42902, 43587, 37165, 43143, 47678, 37154, 36823, 14187, 40264, 29777,
	43317, 35183, 30075, 41068, 41649, 48239, 42959, 50463, 1844, 7403, 43845,
	35488, 37961, 50462, 40263, 7376, 37040, 29739, 26298, 37024, 47669, 50461,
	17814, 50469, 50457, 33318, 39734, 31620, 36979, 47690, 43129, 13992, 43875,
	20633, 29936, 50456, 43908, 43685, 35490, 50468, 29617, 37007, 39208, 47378,
	40327, 43896, 42906, 43842, 30100, 36774, 30353, 13993, 42960, 50455, 43864,
	41674, 43149, 42237, 50460, 47377, 50439, 37421, 50467, 50442, 47104, 39206,
	37178, 1736, 35491, 47660, 39210, 1843, 41955, 43506, 50466, 50454, 40322,
	47680, 43918, 47667, 50438, 41672, 43922,
];

const feedBuilder = {
	async prepareData() {
		// const productsIE = await IE.find();
		// const productsES = await ES.find();
		const productsEN = await EN.find();
		const data = [];
		productsEN.forEach((product) => {
			const {
				domain,
				variantId,
				sku,
				ean,
				brand,
				stock,
				title,
				description,
				media,
				price,
				weight,
			} = product;
			if (domain === 'Tutumi') return;
			if (description === '') return;
			const mappingExists = fruugoCategories.findIndex(
				(dupa) => dupa.variantId === variantId
			);
			if (filterFrugo.some((frug) => frug === variantId)) return;
			if (mappingExists === -1) return;
			if (fruugoCategories[mappingExists].excluded) return;
			const filteredMedia = media
				.map((med, index) => {
					if (index > 4) return;
					const { url, main } = med;
					return {
						url,
						main,
					};
				})
				.filter(Boolean);

			const upperCaseEach = (string) => {
				const sentenceToSplit = string.split(' ');
				return sentenceToSplit.map((sentence) => {
					const lowerCase = sentence.toLowerCase();
					if (lowerCase === '') return lowerCase;
					return lowerCase[0].toUpperCase() + lowerCase.substring(1);
				});
			};
			data.push({
				ProductId: variantId,
				SkuId: sku,
				EAN: ean,
				Brand: brand,
				Category: fruugoCategories[mappingExists].catt,
				StockStatus: stock > 0 ? 'INSTOCK' : 'OUTOFSTOCK',
				StockQuantity: stock,
				PackageWeight: weight,
				Language: 'en',
				Title: upperCaseEach(title).join(' '),
				Description: description,
				NormalPriceWithoutVAT: Math.ceil(price / 1.23),
				VATRate: 23,
				media: filteredMedia,
			});
		});

		// return data
		// 	.map((productEs) => {
		// 		const { ProductId } = productEs;
		//
		// 		const indexES = productsES.findIndex(
		// 			(prod) => prod.variantId === ProductId
		// 		);
		// 		if (indexES === -1) return productEs;
		// 		return {
		// 			...productEs,
		// 			NormalPriceWithoutVAT: Math.ceil(
		// 				productsES[indexES].price / 1.23
		// 			),
		// 		};
		// 	})
		// 	.map((productIe) => {
		// 		const { ProductId } = productIe;
		// 		const indexIE = productsIE.findIndex(
		// 			(prod) => prod.variantId === ProductId
		// 		);
		// 		if (indexIE === -1) return productIe;
		// 		return {
		// 			...productIe,
		// 			NormalPriceWithoutVAT: Math.ceil(
		// 				productsIE[indexIE].price / 1.23
		// 			),
		// 		};
		// 	});
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderFruugoUK(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('Products');
		obj.forEach((o) => {
			const itemFront = root
				.ele('Product')
				.ele('ProductId')
				.txt(`${o.ProductId}`)
				.up()
				.ele('SkuId')
				.txt(`${o.SkuId}`)
				.up()
				.ele('EAN')
				.txt(`${o.EAN}`)
				.up()
				.ele('Brand')
				.txt(`${o.Brand}`)
				.up()
				.ele('Category')
				.txt(`${o.Category}`)
				.up();

			const itemMiddle = () => {
				return o.media.forEach((media, index) => {
					return itemFront
						.ele(`Imageurl${index + 1}`)
						.txt(`${media.url}`)
						.up();
				});
			};

			itemMiddle();

			itemFront
				.ele('StockStatus')
				.txt(`${o.StockStatus}`)
				.up()
				.ele('StockQuantity')
				.txt(`${o.StockQuantity}`)
				.up()
				.ele('PackageWeight')
				.txt(`${o.PackageWeight}`)
				.up()
				.ele('Description')
				.ele('Language')
				.txt(`${o.Language}`)
				.up()
				.ele('Title')
				.txt(`${o.Title}`)
				.up()
				.ele('Description')
				.txt(`${o.Description}`)
				.up()
				.up()
				.ele('Price')
				.ele('NormalPriceWithoutVAT')
				.txt(`${o.NormalPriceWithoutVAT}`)
				.up()
				.ele('VATRate')
				.txt(`${o.VATRate}`)
				.up()
				.up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedFruugoUK() {
		const data = await this.prepareData();
		if (!data) return;
		const xmlMall = await this.feedBuliderFruugoUK(data);
		await this.saveFileToDisk(xmlMall, 'fruugo_uk');
		console.log(`fruugo_uk.xml zapisany.`);
	},
};

const generateFruugoUK = async () => {
	try {
		await feedBuilder.generateFeedFruugoUK();
	} catch (e) {
		console.log(e);
	}
};
export default generateFruugoUK;

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
// generateFruugoUK();
