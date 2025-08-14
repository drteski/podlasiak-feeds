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
				specification,
				price: `${Math.ceil(price)}.00`,
				images: filteredMedia,
				category: category.join(' > '),
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderMojmojsterSi(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('rss', {
				'xmlns:xsi': 'http://base.google.com/ns/1.0',
				version: '2.0',
			})
			.ele('CNJExport');
		obj.forEach((o) => {
			const itemFront = root
				.ele('Item')
				.ele('ID')
				.txt(o.variantId)
				.up()
				.ele('name')
				.txt(o.title)
				.up()
				.ele('description')
				.txt(o.description)
				.up()
				.ele('link')
				.txt(o.url)
				.up()
				.ele('mainImage')
				.txt(o.images[0])
				.up()
				.ele('price')
				.txt(o.price)
				.up()
				.ele('stock')
				.txt(o.stock > 10 ? 'in stock' : 'out of stock')
				.up()
				.ele('fileUnder')
				.txt(o.category)
				.up()
				.ele('brand')
				.txt(o.brand)
				.up()
				.ele('EAN')
				.txt(!o.ean ? 0 : o.ean)
				.up()
				.ele('productCode')
				.txt(o.sku)
				.up()
				.ele('warranty')
				.up()
				.ele('deliveryCost')
				.txt('0')
				.up()
				.ele('deliveryTimeMin')
				.txt('5')
				.up()
				.ele('deliveryTimeMax')
				.txt('7')
				.up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedMojmojsterSi() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderMojmojsterSi(data);
		await this.saveFileToDisk(xmlMall, 'mojmojstersi');
		console.log(`mojmojstersi.xml zapisany.`);
	},
};

const generateMojmojsterSi = async () => {
	try {
		await feedBuilder.generateFeedMojmojsterSi();
	} catch (e) {
		console.log(e);
	}
};
export default generateMojmojsterSi;
