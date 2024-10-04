import CZ from '../models/CZ.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

// JAKIE PRODUKTY BEZ ŁAZIENKI

const feedBuilder = {
	async prepareData() {
		const products = await CZ.find();
		const data = [];

		products.forEach((product) => {
			const {
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

			const filteredMedia = media.map((med) => {
				const { url } = med;
				return url;
			});
			const filteredAttrs = attributes
				.map((attribute, index) => {
					if (index === 0) return;
					if (index === attributes.length - 1) return;
					const { name, value } = attribute;
					return { name, value };
				})
				.filter(Boolean);
			if (domain !== 'Tutumi') return;
			if (
				brand === 'Rea' ||
				brand === 'Toolight' ||
				brand === 'Spectrum LED' ||
				!brand
			)
				return;
			// console.log(brand);
			if (ean === 0 || ean === null) return;
			if (category[0] === '---') return;
			if (category.length <= 1) return;
			if (stock < 10) return;

			const manubrandeansku = [
				{ name: 'Manufacturer', value: brand },
				{ name: `Manufacturer's code`, value: sku },
				{
					name: 'EAN',
					value: ean,
				},
			];

			data.push({
				variantId,
				sku,
				ean,
				title,
				stock,
				weight,
				description,
				category: category.join(' > '),
				url,
				brand,
				price,
				media: filteredMedia,
				attributes: [...manubrandeansku, ...filteredAttrs],
			});
		});

		return data.reduce((previousValue, currentValue) => {
			const currentIndex = previousValue.findIndex(
				(prev) => prev.variantId === currentValue.variantId
			);
			if (currentIndex === -1) return [...previousValue, currentValue];
			return previousValue;
		}, []);
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderFaviTutumiCz(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('offers', {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				varsion: '1',
			});

		obj.forEach((o) => {
			const itemFront = root
				.ele('o', {
					id: o.variantId,
					url: o.url,
					price: o.price,
					avail: '1',
					weight: o.weight,
					basket: 1,
					stock: o.stock,
				})
				.ele('cat')
				.dat(o.category)
				.up()
				.ele('name')
				.dat(o.title)
				.up()
				.ele('imgs');

			o.media.forEach((img, index) => {
				if (index === 0) {
					itemFront.ele('main', { url: img }).up();
				} else {
					itemFront.ele('i', { url: img }).up();
				}
			});

			const nextItems = itemFront.up().ele('attrs');

			o.attributes.forEach((attribute) => {
				nextItems
					.ele('a', { name: attribute.name })
					.dat(attribute.value)
					.up();
			});

			nextItems.up().up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},

	async generateFeedFaviTutumiCz() {
		const data = await this.prepareData();
		const xmlMall = await feedBuilder.feedBuliderFaviTutumiCz(data);
		await this.saveFileToDisk(xmlMall, 'favi_tutumi_cz');
		console.log(`favi_tutumi_cz.xml zapisany.`);
	},
};

const generateFaviTutumiCzFeed = async () => {
	try {
		await feedBuilder.generateFeedFaviTutumiCz();
	} catch (e) {
		console.log(e);
	}
};
export default generateFaviTutumiCzFeed;

import mongoose from 'mongoose';

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
// generateFaviTutumiCzFeed();
