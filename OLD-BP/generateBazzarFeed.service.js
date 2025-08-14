import HR from '../models/HR.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await HR.find();
		const data = [];
		products.forEach((product) => {
			const {
				title,
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

			return data.push({
				title,
				brand,
				stock,
				sku,
				ean,
				weight,
				description,
				specification,
				price_mpc: `${Math.ceil(price / 1.25 / 1.25)}.00`,
				price_mpc_discount: `${Math.ceil(price / 1.25 / 1.25)}.00`,
				price_vpc: `${Math.ceil(price / 1.25 / 1.25)}.00`,
				images: filteredMedia,
				category: category.join(', '),
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderBazzar(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('products');
		obj.forEach((o) => {
			const itemFront = root
				.ele('product')
				.ele('id')
				.txt(`${o.sku}`)
				.up()
				.ele('title')
				.txt(`${o.title}`)
				.up()
				.ele('brand')
				.txt(`${o.brand}`)
				.up()
				.ele('stock')
				.txt(`${o.stock}`)
				.up()
				.ele('ean')
				.txt(`${o.ean}`)
				.up()
				.ele('weight')
				.txt(`${o.weight}`)
				.up()
				.ele('description')
				.txt(`${o.description}`)
				.up()
				.ele('price_mpc')
				.txt(`${o.price_mpc}`)
				.up()
				.ele('price_mpc_discount')
				.txt(`${o.price_mpc_discount}`)
				.up()
				.ele('price_vpc')
				.txt(`${o.price_vpc}`)
				.up()
				.ele('category')
				.txt(`${o.category}`)
				.up()
				.ele('images');

			const itemMiddle = () => {
				return o.images.forEach((img) => {
					return itemFront.ele('image').txt(`${img}`).up().up();
				});
			};

			itemMiddle();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedBazzar() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderBazzar(data);
		await this.saveFileToDisk(xmlMall, 'bazzar');
		console.log(`bazzar.xml zapisany.`);
	},
};

const generateBazzar = async () => {
	try {
		await feedBuilder.generateFeedBazzar();
	} catch (e) {
		console.log(e);
	}
};
export default generateBazzar;
