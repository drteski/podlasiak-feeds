import SK from '../models/SK.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await SK.find();
		const data = [];

		products.forEach((product) => {
			const {
				id,
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
				id,
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
				media: filteredMedia,
				attributes: filteredAttrs,
			});
		});

		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderGenericXML(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('products', {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				version: '1',
			});

		obj.forEach((o) => {
			const itemFront = root
				.ele('product')
				.ele('id')
				.txt(`${o.id}`)
				.up()
				.ele('variantId')
				.txt(`${o.variantId}`)
				.up()
				.ele('website')
				.txt(`${o.domain}`)
				.up()
				.ele('url')
				.txt(`${o.url}`)
				.up()
				.ele('sku')
				.txt(`${o.sku}`)
				.up()
				.ele('ean')
				.txt(`${o.ean}`)
				.up()
				.ele('title')
				.txt(`${o.title}`)
				.up()
				.ele('description')
				.txt(`${o.description}`)
				.up()
				.ele('category')
				.txt(`${o.category}`)
				.up()
				.ele('brand')
				.txt(`${o.brand}`)
				.up()
				.ele('stock')
				.txt(`${o.stock}`)
				.up()
				.ele('price')
				.txt(`${o.price}`)
				.up()
				.ele('weight')
				.txt(`${o.weight}`)
				.up()
				.ele('images');

			const itemMiddle = () => {
				return o.media.forEach((media, index) =>
					itemFront.ele('image', { id: index }).txt(`${media}`).up()
				);
			};

			itemMiddle();

			const nextPart = itemFront.up().ele('attributes');

			const itemAttrs = () => {
				return o.attributes.forEach((attribute) =>
					nextPart

						.ele('attribute', { name: attribute.name })
						.txt(`${attribute.value}`)
						.up()
				);
			};
			itemAttrs();
			const final = itemFront.up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},

	async generateFeedGenericXML() {
		const data = await this.prepareData();
		const xmlMall = await feedBuilder.feedBuliderGenericXML(data);
		await this.saveFileToDisk(xmlMall, 'generic_sk');
		console.log(`generic_sk.xml zapisany.`);
	},
};

const generateGenericXMLFeed = async () => {
	try {
		await feedBuilder.generateFeedGenericXML();
	} catch (e) {
		console.log(e);
	}
};
export default generateGenericXMLFeed;
