import BG from '../models/BG.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await BG.find();
		const data = [];
		products.forEach((product) => {
			const {
				domain,
				variantId,
				brand,
				title,
				url,
				price,
				media,
				category,
				description,
				ean,
				sku,
				attributes,
			} = product;
			if (domain !== 'Rea') return;
			if (category.includes('---')) return;
			const deliveryTime = '6 дни';
			const deliveryCost = 'FREE';

			data.push({
				ProductNumber: sku,
				Identifier: variantId,
				Manufacturer: brand,
				Name: title,
				ProductUrl: url,
				Price: price,
				ImageUrl: media[0].url,
				Category: category.join(' > '),
				Description: description.replace(/[&oacute;]/gm, ''),
				DeliveryTime: deliveryTime,
				DeliveryCost: deliveryCost,
				EanCode: ean,
				Attributes: attributes,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderPazaruvaj(obj) {
		const root = builder
			.create({ version: '1.0', encoding: 'UTF-8' })
			.ele('Products');
		obj.forEach((product) => {
			const itemFront = root
				.ele('Product')
				.ele('ProductNumber')
				.txt(`${product.ProductNumber}`)
				.up()
				.ele('Identifier')
				.txt(`${product.Identifier}`)
				.up()
				.ele('Manufacturer')
				.txt(`${product.Manufacturer}`)
				.up()
				.ele('Name')
				.txt(`${product.Name}`)
				.up()
				.ele('ProductUrl')
				.txt(`${product.ProductUrl}`)
				.up()
				.ele('Price')
				.txt(`${product.Price}`)
				.up()
				.ele('ImageUrl')
				.txt(`${product.ImageUrl}`)
				.up()
				.ele('Category')
				.txt(`${product.Category}`)
				.up()
				.ele('Description')
				.txt(`${product.Description}`)
				.up()
				.ele('DeliveryTime')
				.txt(`${product.DeliveryTime}`)
				.up()
				.ele('DeliveryCost')
				.txt(`${product.DeliveryCost}`)
				.up()
				.ele('EanCode')
				.txt(`${product.EanCode}`)
				.up()
				.ele('Attributes');

			const itemMiddle = () => {
				return product.Attributes.forEach((attr) =>
					itemFront
						.ele('Attribute')
						.ele('Attribute_name')
						.txt(`${attr.name}`)
						.up()
						.ele('Attribute_value')
						.txt(`${attr.value}`)
						.up()
				);
			};

			itemMiddle();
			const itemEnd = itemFront.up();
		});

		return root.end({ format: 'xml', prettyPrint: true });
	},
	async generateFeedPazaruvaj() {
		const data = await this.prepareData();
		const xmlPazaruvaj = await feedBuilder.feedBuliderPazaruvaj(data);
		await this.saveFileToDisk(xmlPazaruvaj, 'pazaruvaj');
		console.log(`pazaruvaj.xml zapisany.`);
	},
};

const generatePazaruvaj = async () => {
	try {
		await feedBuilder.generateFeedPazaruvaj();
	} catch (e) {
		console.log(e);
	}
};

export default generatePazaruvaj;
