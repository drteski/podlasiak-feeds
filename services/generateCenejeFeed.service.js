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
				domain,
				variantId,
				brand,
				title,
				stock,
				description,
				url,
				ean,
				media,
				attributes,
				price,
				sku,
				category,
			} = product;

			if (domain !== 'Rea') return;

			const specs = () => {
				const joinedSpec = attributes
					.map((spec, index) => {
						if (index === 0) return;
						return `<li>${spec.name}: ${spec.value}</li>`;
					})
					.join('');

				return `<ul>${joinedSpec}</ul>`;
			};
			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return { url, main };
			});
			const filteredAttrs = attributes.map((attribute) => {
				const { name, value } = attribute;
				return { name, value };
			});

			data.push({
				id: variantId,
				name: title,
				description,
				link: url,
				brand,
				quantity: stock,
				fileUnder: category[category.length - 1],
				stock: stock > 0 ? 'in stock' : 'out of stock',
				ean: !ean ? '' : ean,
				price,
				images: filteredMedia,
				productCode: sku,
				specifications: specs(),
				attributes: filteredAttrs,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderCeneje(obj) {
		const root = builder
			.create({ version: '1.0', encoding: 'UTF-8' })
			.ele('CNJExport');
		obj.forEach((product) => {
			const itemMiddle = () => {
				return product.images
					.map((img) => {
						if (!img.main) return img.url;
					})
					.join(',');
			};
			const itemFront = root
				.ele('Item')
				.ele('ID')
				.dat(`${product.id}`)
				.up()
				.ele('name')
				.dat(`${product.name}`)
				.up()
				.ele('description')
				.dat(`${product.description}`)
				.up()
				.ele('specifications')
				.dat(`${product.specifications}`)
				.up()
				.ele('link')
				.dat(`${product.link}`)
				.up()
				.ele('mainImage')
				.dat(`${product.images[0].url}`)
				.up()
				.ele('moreImages')
				.dat(`${itemMiddle()}`)
				.up()
				.ele('price')
				.txt(`${product.price}`)
				.up()
				.ele('stock')
				.txt(`${product.stock}`)
				.up()
				.ele('inStoreAvailability')
				.ele('store')
				.dat(
					'Podlasiak Andrzej Cylwik Sp.K., Przędzalniana 6L, Białystok 15-688, Polska'
				)
				.up()
				.ele('availability')
				.txt('today')
				.up()
				.ele('quantity')
				.txt(`${product.quantity}`)
				.up()
				.up()
				.ele('fileUnder')
				.dat(`${product.fileUnder}`)
				.up()
				.ele('brand')
				.dat(`${product.brand}`)
				.up()
				.ele('EAN')
				.dat(`${product.ean}`)
				.up()
				.ele('productCode')
				.dat(`${product.productCode}`)
				.up()
				.ele('contition')
				.dat(`new`)
				.up()
				.ele('warranty')
				.dat('2 years')
				.up()
				.ele('deliveryCost')
				.txt('0')
				.up()
				.ele('attributes');

			const attributeTags = () => {
				return product.attributes.forEach((attribute) =>
					itemFront
						.ele('atribute')
						.ele('name')
						.dat(`${attribute.name}`)
						.up()
						.ele('values')
						.ele('value')
						.dat(`${attribute.value}`)
						.up()
						.up()
				);
			};
			attributeTags();
		});

		return root.end({ format: 'xml', prettyPrint: true });
	},
	async generateFeedCeneje() {
		const data = await this.prepareData();
		const xmlCeneje = await feedBuilder.feedBuliderCeneje(data);
		await this.saveFileToDisk(xmlCeneje, 'ceneje');
		console.log(`ceneje.xml zapisany.`);
	},
};

const generateCeneje = async () => {
	try {
		await feedBuilder.generateFeedCeneje();
	} catch (e) {
		console.log(e);
	}
};

export default generateCeneje;
