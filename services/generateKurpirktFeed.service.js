import LV from '../models/LV.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';
import slugify from 'slugify';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await LV.find();
		const data = [];
		products.forEach((product) => {
			const { domain, title, url, price, media, brand, category, stock } =
				product;
			if (domain !== 'Rea') return;
			if (category[0] === '---') return;
			if (category.length <= 1) return;
			if (stock < 10) return;

			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return url;
			});

			const slug = () => {
				return (
					'https://vannasistaba-rea.lv/' +
					category
						.map((cat) => {
							return slugify(cat, {
								replacement: '-',
								lower: true,
								locale: 'lv',
							});
						})
						.join('/') +
					'.html'
				);
			};

			data.push({
				name: title,
				link: url,
				price,
				image: filteredMedia[0],
				manufacturer: brand,
				category: category[category.length - 1],
				category_full: category.join(' > '),
				category_link: slug(),
				in_stock: stock,
				delivery_cost_riga: 0,
				used: 0,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderKurpirkt(obj) {
		const root = builder
			.create({ version: '1.0', encoding: 'UTF-8' })
			.ele('root');
		obj.forEach((product) => {
			const itemFront = root
				.ele('item')
				.ele('name')
				.txt(`${product.name}`)
				.up()
				.ele('link')
				.txt(`${product.link}`)
				.up()
				.ele('price')
				.txt(`${product.price}`)
				.up()
				.ele('image')
				.txt(`${product.image}`)
				.up()
				.ele('manufacturer')
				.txt(`${product.manufacturer}`)
				.up()
				.ele('category')
				.txt(`${product.category}`)
				.up()
				.ele('category_full')
				.txt(`${product.category_full}`)
				.up()
				.ele('category_link')
				.txt(`${product.category_link}`)
				.up()
				.ele('in_stock')
				.txt(`${product.in_stock}`)
				.up()
				.ele('delivery_cost_riga')
				.txt(`${product.delivery_cost_riga}`)
				.up()
				.ele('used')
				.txt(`${product.used}`)
				.up()
				.up();
		});

		return root.end({ format: 'xml', prettyPrint: true });
	},
	async generateFeedKurpirkt() {
		const data = await this.prepareData();
		const xmlKurpirkt = await feedBuilder.feedBuliderKurpirkt(data);
		await this.saveFileToDisk(xmlKurpirkt, 'kurpirkt');
		console.log(`kurpirkt.xml zapisany.`);
	},
};

const generateKurpirkt = async () => {
	try {
		await feedBuilder.generateFeedKurpirkt();
	} catch (e) {
		console.log(e);
	}
};

export default generateKurpirkt;

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
//
// generateKurpirkt();
