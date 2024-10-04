import CZ from '../models/CZ.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';

dotenv.config({ path: '../.env' });

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
			const filteredAttrs = attributes.map((attribute) => {
				const { name, value } = attribute;
				return { name, value };
			});

			data.push({
				variantId,
				sku,
				ean: ean === 0 || ean === null ? 0 : ean,
				title,
				description,
				mainCategory: 'Vybavení koupelny',
				category: category.join(' | '),
				url,
				brand,
				price,
				media: filteredMedia,
				attributes: filteredAttrs,
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
	async feedBuliderHeureka(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('SHOP');

		obj.forEach((o) => {
			const itemFront = root
				.ele('SHOPITEM')
				.ele('ITEM_ID')
				.txt(o.variantId)
				.up()
				.ele('PRODUCTNAME')
				.txt(o.title)
				.up()
				.ele('PRODUCT')
				.txt(o.title)
				.up()
				.ele('DESCRIPTION')
				.txt(o.description)
				.up()
				.ele('URL')
				.txt(o.url)
				.up()
				.ele('IMGURL')
				.txt(o.media[0])
				.up()
				.ele('IMGURL_ALTERNATIVE')
				.txt(o.media.length > 1 ? o.media[1] : o.media[0])
				.up()
				.ele('PRICE_VAT')
				.txt(o.price)
				.up()
				.ele('MANUFACTURER')
				.txt(o.brand)
				.up()
				.ele('MAINCATEGORY')
				.txt(o.mainCategory)
				.up()
				.ele('CATEGORIES')
				.txt(o.category)
				.up()
				.ele('EAN')
				.txt(o.ean)
				.up()
				.ele('PRODUCTNO')
				.txt(o.sku)
				.up()
				.ele('DELIVERY_DATE')
				.txt('2')
				.up()
				.ele('DELIVERY')
				.ele('DELIVERY_ID')
				.txt('DPD')
				.up()
				.ele('DELIVERY_PRICE')
				.txt('0')
				.up()
				.ele('DELIVERY_PRICE_COD')
				.txt('0')
				.up()
				.up();

			const itemAttrs = () => {
				return o.attributes.forEach((attribute) => {
					if (attribute.name === 'Wariant opcji') return;
					itemFront
						.ele('PARAM')
						.ele('PARAM_NAME')
						.txt(attribute.name)
						.up()
						.ele('VAL')
						.txt(`${attribute.value}`)
						.up()
						.up();
				});
			};
			itemAttrs();
			const final = itemFront.up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},

	async generateFeedHeureka() {
		const data = await this.prepareData();
		const xmlMall = await feedBuilder.feedBuliderHeureka(data);
		await this.saveFileToDisk(xmlMall, 'heureka_cz');
		console.log(`heureka_cz.xml zapisany.`);
	},
};

const generateHeurekaFeed = async () => {
	try {
		await feedBuilder.generateFeedHeureka();
	} catch (e) {
		console.log(e);
	}
};
export default generateHeurekaFeed;

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
// generateHeurekaFeed();
