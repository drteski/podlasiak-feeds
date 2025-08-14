import CZ from '../models/CZ.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';

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
	async feedBuliderShoptet(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('SHOP', {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				varsion: '1',
			});

		obj.forEach((o) => {
			const itemFront = root
				.ele('SHOPITEM')
				.ele('NAME')
				.txt(o.title)
				.up()
				.ele('SHORT_DESCRIPTION')
				.txt(o.description)
				.up()
				.ele('DESCRIPTION')
				.txt(o.description)
				.up()
				.ele('WARRANTY')
				.txt(o.description)
				.up()
				.ele('ITEM_TYPE')
				.txt('product')
				.up()
				.ele('CODE')
				.txt(o.sku)
				.up()
				.ele('EAN')
				.txt(o.ean)
				.up()
				.ele('CATEGORIES')
				.txt(o.description)
				.up()
				.ele('IMAGES')
				.txt(o.description)
				.up()
				.ele('INFORMATION_PARAMETERS')
				.txt(o.description)
				.up()
				.ele('FREE_SHIPPING')
				.txt('0')
				.up()
				.ele('FREE_BILLING')
				.txt('0')
				.up()
				.ele('VISIBILITY')
				.txt(o.stock > 0 ? 'visible' : 'hidden')
				.up()
				.ele('DESCRIPTION')
				.txt(o.description)
				.up()
				.ele('DESCRIPTION')
				.txt(o.description)
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

	async generateFeedShoptet() {
		const data = await this.prepareData();
		const xmlMall = await feedBuilder.feedBuliderShoptet(data);
		await this.saveFileToDisk(xmlMall, 'shoptet_cz');
		console.log(`shoptet_cz.xml zapisany.`);
	},
};

const generateShoptetFeed = async () => {
	try {
		await feedBuilder.generateFeedShoptet();
	} catch (e) {
		console.log(e);
	}
};
export default generateShoptetFeed;

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
// generateShoptetFeed();
