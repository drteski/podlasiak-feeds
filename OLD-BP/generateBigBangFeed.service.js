import SI from '../models/SI.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await SI.find();
		const data = [];
		products.forEach((product) => {
			const {
				variantId,
				title,
				url,
				brand,
				stock,
				ean,
				weight,
				sku,
				description,
				price,
				media,
				category,
				attributes,
			} = product;
			const filteredMedia = media.map((med) => {
				const { url } = med;
				return url;
			});

			const specification = attributes
				.map((attr) => `${attr.name}: ${attr.value}`)
				.join(' ');
			const findClosest = (arr, num) => {
				if (arr == null) {
					return;
				}

				let closest = arr[0];
				for (let item of arr) {
					if (Math.abs(item - num) < Math.abs(closest - num)) {
						closest = item;
					}
				}
				return closest;
			};
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
					dotIndexes[
						dotIndexes.indexOf(findClosest(dotIndexes, half))
					] + 1
				);
				const secondPart = description.slice(
					dotIndexes[
						dotIndexes.indexOf(findClosest(dotIndexes, half))
					] + 1,
					-1
				);
				return [firstPart, secondPart];
			};

			return data.push({
				variantId,
				title,
				brand,
				url,
				stock,
				sku,
				ean,
				weight,
				description,
				shortDesc: descriptionSplitter(),
				specification,
				price,
				images: filteredMedia,
				category: category[category.length - 1],
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderBigBang(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('import');

		const firstPart = () => {
			const first = root.root().ele('products');
			obj.forEach((o) => {
				const subFirst = first
					.ele('product')
					.ele('productCategory')
					.txt(o.category)
					.up()
					.ele('sku')
					.txt(o.sku)
					.up()
					.ele('ean')
					.txt(o.ean)
					.up()
					.ele('brand')
					.txt(o.brand)
					.up()
					.ele('productTitle_sl')
					.txt(o.title)
					.up()
					.ele('mainImage')
					.txt(o.images[0])
					.up();
				o.images.forEach((med, index) => {
					if (index === 0) return;
					subFirst.ele(`Image${index}`).txt(med).up();
				});

				subFirst
					.ele('description_sl')
					.txt(o.description)
					.up()
					.ele('shortDescription_sl')
					.txt(o.shortDesc[0])
					.up();
			});
		};

		const secondPart = () => {
			const second = root.root().ele('offers');
			obj.forEach((o) => {
				second
					.ele('offer')
					.ele('sku')
					.txt(o.sku)
					.up()
					.ele('product-id')
					.txt(o.ean)
					.up()
					.ele('product-id-type')
					.txt('EAN')
					.up()
					.ele('price')
					.txt(o.price)
					.up()
					.ele('quantity')
					.txt(o.stock)
					.up()
					.ele('state')
					.txt('1')
					.up();
			});
		};
		firstPart();
		secondPart();

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},

	async generateFeedBigBang() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderBigBang(data);
		await this.saveFileToDisk(xmlMall, 'bigbang');
		console.log(`bigbang.xml zapisany.`);
	},
};

const generateBigBang = async () => {
	try {
		await feedBuilder.generateFeedBigBang();
	} catch (e) {
		console.log(e);
	}
};
export default generateBigBang;

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
// generateBigBang();
