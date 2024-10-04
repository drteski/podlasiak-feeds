import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import builder from 'xmlbuilder2';
import BE from '../models/BE.js';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await BE.find();
		const data = [];
		products.forEach((product) => {
			const {
				domain,
				variantId,
				sku,
				brand,
				stock,
				title,
				url,
				description,
				category,
				media,
				price,
				attributes,
			} = product;
			if (domain !== 'Rea') return;

			const preparedMedia = media.map((img) => {
				return { mediaType: 'IMAGE', mediaUrl: img.url };
			});
			const filteredAttrs = attributes
				.map((attribute) => {
					const { name, value } = attribute;
					if (name === 'Wariant opcji') return;
					return { name, value };
				})
				.filter(Boolean);

			const upperCaseEach = (string) => {
				const sentenceToSplit = string.split(' ');
				return sentenceToSplit.map((sentence) => {
					const lowerCase = sentence.toLowerCase();
					if (lowerCase === '') return lowerCase;
					return lowerCase[0].toUpperCase() + lowerCase.substring(1);
				});
			};
			data.push({
				shopOfferId: variantId,
				shopCategory: category[category.length - 1],
				deepLink: url,
				productName: upperCaseEach(title).join(' '),
				productDescription: description,
				brand: brand,
				identifierType: 'SKU',
				identifierValue: sku,
				basePrice: price,
				originalPrice: price,
				productState: 'NEW',
				productCondition: 'New',
				media: preparedMedia,
				inStock: stock > 0 ? 'TRUE' : 'FALSE',
				countryCode: 'PL',
				deliveryTime: '4 days',
				deliveryMethod: 'DELIVERY',
				deliveryPrice: 0,
				features: filteredAttrs,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderComparer(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('feed')
			.ele('offers');
		obj.forEach((o) => {
			const itemFront = root
				.ele('offer')
				.ele('shopOfferId')
				.txt(o.shopOfferId)
				.up()
				.ele('shopCategory')
				.txt(o.shopCategory)
				.up()
				.ele('products')
				.ele('product')
				.ele('name')
				.txt(o.productName)
				.up()
				.ele('description')
				.txt(o.productDescription)
				.up()
				.ele('brand')
				.txt(o.brand)
				.up()
				.ele('identifiers')
				.ele('identifier')
				.ele('type')
				.txt(o.identifierType)
				.up()
				.ele('value')
				.txt(o.identifierValue)
				.up()
				.up()
				.up()
				.ele('features');

			const attributes = () => {
				return o.features.forEach((feature) => {
					return itemFront
						.ele('feature')
						.ele('name')
						.txt(feature.name)
						.up()
						.ele('value')
						.txt(feature.value)
						.up();
				});
			};
			attributes();

			const middle = itemFront
				.up()
				.ele('state')
				.txt(o.productState)
				.up()
				.ele('productCondition')
				.txt(o.productCondition)
				.up()
				.up()
				.up()
				.ele('basePrice')
				.txt(o.basePrice)
				.up()
				.ele('originalPrice')
				.txt(o.originalPrice)
				.up()
				.ele('deepLink')
				.txt(o.url)
				.up()
				.ele('media');

			const itemMiddle = () => {
				return o.media.forEach((media) => {
					return middle
						.ele('medium')
						.ele('type')
						.txt(media.mediaType)
						.up()
						.ele('url')
						.txt(media.mediaUrl)
						.up()
						.up();
				});
			};

			itemMiddle();

			middle
				.up()
				.ele('inStock')
				.txt(o.inStock)
				.up()
				.ele('shippingOptions')
				.ele('shippingOption')
				.ele('countryCode')
				.txt(o.countryCode)
				.up()
				.ele('deliveryTime')
				.txt(o.deliveryTime)
				.up()
				.ele('method')
				.txt(o.deliveryMethod)
				.up()
				.ele('price')
				.txt(o.deliveryPrice);
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedComparer() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderComparer(data);
		await this.saveFileToDisk(xmlMall, 'comparer');
		console.log(`comparer.xml zapisany.`);
	},
};

const generateComparer = async () => {
	try {
		await feedBuilder.generateFeedComparer();
	} catch (e) {
		console.log(e);
	}
};
export default generateComparer;

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
// generateComparer();
