import EL from '../models/EL.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';
import timestamp from 'time-stamp';
import { skroutzCategories } from '../data/skroutzCategories.js';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await EL.find();
		const data = [];
		const categories = [];
		products.forEach((product) => {
			const {
				domain,
				variantId,
				brand,
				title,
				stock,
				description,
				weight,
				url,
				ean,
				media,
				price,
				sku,
			} = product;
			// if (domain !== 'Rea') return;

			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return { url, main };
			});

			const currentCategory = skroutzCategories.filter(
				(category) => category.variantId === variantId
			);

			if (currentCategory.length === 0) return;

			// if (!sku || sku === '') return;

			data.push({
				id: variantId,
				name: title,
				link: url,
				image: filteredMedia[0].url,
				additionalimage: filteredMedia,
				category: currentCategory[0].category,
				price_with_vat: price,
				vat: 24,
				manufacturer: brand,
				mpn: !sku ? '' : sku,
				ean: !ean ? '' : ean,
				availability: 'Παράδοση 1 έως 3 ημέρες',
				weight: weight * 1000,
				description: description
					.replace('&oacute;', 'ó')
					.replace('żar&oacute;wki', '*'),
				quantity: stock,
			});
		});
		return data;
	},

	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderSkroutz(obj) {
		const root = builder
			.create({ version: '1.0', encoding: 'UTF-8' })
			.ele('rea')
			.ele('created_at')
			.txt(timestamp('DD-MM-YYYY HH:mm'))
			.up()
			.ele('products');
		obj.forEach((product) => {
			const itemFront = root
				.ele('product')
				.ele('id')
				.txt(`${product.id}`)
				.up()
				.ele('name')
				.dat(`${product.name}`)
				.up()
				.ele('link')
				.dat(`${product.link}`)
				.up();
			product.additionalimage.forEach((img, index) => {
				if (index === 0)
					return itemFront.ele('image').dat(`${img.url}`).up();
				return itemFront.ele('additionalimage').dat(`${img.url}`).up();
			});

			itemFront
				.ele('category')
				.dat(`${product.category}`)
				.up()
				.ele('price_with_vat')
				.txt(`${product.price_with_vat}`)
				.up()
				.ele('vat')
				.txt(`${product.vat}`)
				.up()
				.ele('manufacturer')
				.dat(`${product.manufacturer}`)
				.up()
				.ele('mpn')
				.txt(`${product.mpn}`)
				.up()
				.ele('ean')
				.txt(`${product.ean}`)
				.up()
				.ele('availability')
				.txt(`${product.availability}`)
				.up()
				.ele('weight')
				.txt(`${product.weight}`)
				.up()
				.ele('description')
				.txt(`${product.description}`)
				.up()
				.ele('quantity')
				.txt(`${product.quantity}`)
				.up()
				.up();
		});

		return root.end({ format: 'xml', prettyPrint: true });
	},
	async generateFeedSkroutz() {
		const data = await this.prepareData();
		const xmlSkroutz = await feedBuilder.feedBuliderSkroutz(data);
		await this.saveFileToDisk(xmlSkroutz, 'skroutz');
		console.log(`skroutz.xml zapisany.`);
	},
};

const generateSkroutz = async () => {
	try {
		await feedBuilder.generateFeedSkroutz();
	} catch (e) {
		console.log(e);
	}
};

export default generateSkroutz;

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
// generateSkroutz();
