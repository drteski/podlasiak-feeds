import DE from '../models/DE.js';
import EN from '../models/EN.js';
import ES from '../models/ES.js';
import FR from '../models/FR.js';
import IT from '../models/IT.js';
import dotenv from 'dotenv';
import fs from 'fs';
import builder from 'xmlbuilder2';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData(lang) {
		let products;
		let deliveryTime;
		switch (lang) {
			case 'de':
				products = await DE.find();
				deliveryTime = 'Lieferung in 3-5 Tagen';
				break;
			case 'en':
				products = await EN.find();
				deliveryTime = 'Delivery in 3-5 days';
				break;
			case 'es':
				products = await ES.find();
				deliveryTime = 'Entrega en 3-5 días';
				break;
			case 'fr':
				products = await FR.find();
				deliveryTime = 'Livraison en 3-5 jours';
				break;
			case 'it':
				products = await IT.find();
				deliveryTime = 'Consegna in 3-5 giorni';
				break;
			default:
				console.error(`Pomijam - ${lang}`);
				return;
		}

		const data = [];

		products.forEach((product) => {
			const {
				domain,
				variantId,
				title,
				description,
				brand,
				url,
				media,
				attributes,
				price,
			} = product;
			if (data.some((dat) => dat.id === variantId)) return;
			if (typeof brand === 'undefined') return;
			if (domain !== 'Rea') return;

			const filteredMedia = media
				.map((med) => {
					const { url } = med;
					return url;
				})
				.filter(Boolean);

			return data.push({
				variantId,
				title,
				description,
				brand,
				url: url + '?utm_source=idealo&utm_medium=cpc',
				media: filteredMedia,
				deliveryTime,
				attributes,
				price,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderBiano(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('ITEMS', {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				version: '1',
			});
		obj.forEach((o) => {
			const itemFront = root
				.ele('ITEM')
				.ele('ITEM_ID')
				.txt(`${o.variantId}`)
				.up()
				.ele('PRODUCTNAME')
				.txt(`${o.title}`)
				.up()
				.ele('DESCRIPTION')
				.txt(`${o.description}`)
				.up()
				.ele('MANUFACTURER')
				.txt(`${o.brand}`)
				.up()
				.ele('URL')
				.txt(`${o.url}`)
				.up()
				.ele('IMGURL')
				.txt(`${o.media[0]}`)
				.up()
				.ele('IMGURL_ALTERNATIVE')
				.txt(`${o.media[1]}`)
				.up()
				.ele('IMGURL_ALTERNATIVE')
				.txt(`${o.media[1]}`)
				.up()
				.ele('DELIVERY_DATE')
				.txt(`0`)
				.up()
				.ele('SALE_PRICE')
				.txt(`${o.price}`)
				.up()
				.ele('DELIVERY')
				.ele('DELIVERY_ID')
				.txt('Corriere')
				.up()
				.ele('DELIVERY_PRICE')
				.txt('0')
				.up()
				.up();

			const itemAttributes = () => {
				return o.attributes.forEach((attr, index) => {
					if (index === 0) return;
					return itemFront
						.ele('PARAM')
						.ele('PARAM_NAME')
						.txt(`${attr.name}`)
						.up()
						.ele('VAL')
						.txt(`${attr.value}`)
						.up()
						.up();
				});
			};
			itemAttributes();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedBiano(lang) {
		const data = await this.prepareData(lang);
		if (!data) return;
		const xmlMall = await this.feedBuliderBiano(data);
		await this.saveFileToDisk(xmlMall, `biano_${lang}`);
		console.log(`biano_${lang}.xml zapisany.`);
	},
};

const generateBianoXmlFeed = async (lang) => {
	try {
		await feedBuilder.generateFeedBiano(lang);
	} catch (e) {
		console.log(e);
	}
};

export default generateBianoXmlFeed;

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
// 	console.log('Połączono');
// });
//
// generateBianoXmlFeed('it');
