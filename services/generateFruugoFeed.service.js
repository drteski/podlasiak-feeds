import fs from 'fs';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
import builder from 'xmlbuilder2';
import fruugoCategories from '../data/frugoCategories.js';
import IE from '../models/IE.js';
import ES from '../models/ES.js';
import EN from '../models/EN.js';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const productsIE = await IE.find();
		const productsES = await ES.find();
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

		return data
			.map((productEs) => {
				const { ProductId } = productEs;

				const indexES = productsES.findIndex(
					(prod) => prod.variantId === ProductId
				);
				if (indexES === -1) return productEs;
				return {
					...productEs,
					NormalPriceWithoutVAT: Math.ceil(
						productsES[indexES].price / 1.23
					),
				};
			})
			.map((productIe) => {
				const { ProductId } = productIe;
				const indexIE = productsIE.findIndex(
					(prod) => prod.variantId === ProductId
				);
				if (indexIE === -1) return productIe;
				return {
					...productIe,
					NormalPriceWithoutVAT: Math.ceil(
						productsIE[indexIE].price / 1.23
					),
				};
			});
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderFruugo(obj) {
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
	async generateFeedFruugo() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderFruugo(data);
		await this.saveFileToDisk(xmlMall, 'fruugo');
		console.log(`fruugo.xml zapisany.`);
	},
};

const generateFruugo = async () => {
	try {
		await feedBuilder.generateFeedFruugo();
	} catch (e) {
		console.log(e);
	}
};
export default generateFruugo;

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
// generateFruugo();
