import SI from '../models/SI.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';
// import mongoose from 'mongoose';
import csvtojson from 'csvtojson';
import downloadHandler from '../utilities/downloadCsv.utility.js';

dotenv.config({ path: '../.env' });

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

const feedBuilder = {
	async prepareData() {
		const products = await SI.find();
		const data = [];

		const mapping = await csvtojson()
			.fromFile('../generate/enaa/enaa.csv')
			.then((json) => {
				return json;
			})
			.map((item) => {
				return {
					variantId: parseInt(item.variantId),
					idEnaa: item.id_enaa,
				};
			});

		products.forEach((product) => {
			const {
				variantId,
				title,
				url,
				description,
				attributes,
				category,
				media,
				price,
				brand,
				sku,
				ean,
				weight,
			} = product;
			if (data.some((dat) => dat.id === variantId)) return;
			if (typeof brand === 'undefined') return;
			if (
				mapping.findIndex((item) => item.variantId === variantId) === -1
			)
				return;

			const filteredMedia = media
				.map((med, index) => {
					if (index >= 10) return;
					const { url } = med;
					return url;
				})
				.filter(Boolean);

			const mapCategories = () => {
				const finalCategory = category[category.length - 1];
				const mapIndex = mapping.findIndex(
					(item) => item.variantId === variantId
				);

				if (mapping[mapIndex].idEnaa === '')
					return { name: finalCategory, idEnaa: variantId };

				return {
					name: finalCategory,
					idEnaa: mapping[mapIndex].idEnaa,
				};
			};

			return data.push({
				id: variantId,
				title,
				url,
				description,
				attributes,
				category: mapCategories(),
				media: filteredMedia,
				price: (price / 1.25).toFixed(2),
				brand,
				sku,
				ean,
				weight,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderEnaa(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('podjetje', { id: 'Podlasiak' })
			.ele('izdelki');
		obj.forEach((o) => {
			const itemFront = root
				.ele('izdelek', { st: o.id })
				.ele('izdelekID')
				.txt(`${o.id}`)
				.up()
				.ele('izdelekIme')
				.dat(`${o.title}`)
				.up()
				.ele('url')
				.dat(`${o.url}`)
				.up()
				.ele('opis')
				.dat(`${o.description}`)
				.up()
				.ele('dodatneLastnosti');

			const itemAttributes = () => {
				return o.attributes.forEach((attr) => {
					if (attr.name === 'Wariant opcji') return;
					if (attr.name === 'Informacije o dostavi') return;
					return itemFront
						.ele('lastnost', { naziv: `${attr.name}` })
						.dat(`${attr.value}`)
						.up();
				});
			};
			itemAttributes();

			const itemMiddle = itemFront
				.up()
				.ele('slikaVelika')
				.dat(`${o.media[0]}`)
				.up()
				.ele('dodatneSlike');

			const itemImages = () => {
				return o.media.forEach((img, index) => {
					return itemMiddle
						.ele(`dodatnaSlika${index + 1}`)
						.dat(`${img}`)
						.up()
						.up();
				});
			};
			const itemPrices = itemFront
				.up()
				.ele('blagovnaZnamka', {
					id:
						o.brand === 'Rea'
							? 1
							: o.brand === 'Tutumi'
							? 2
							: o.brand === 'Toolight'
							? 3
							: 4,
				})
				.dat(`${o.brand}`)
				.up()
				.ele('kategorija', { id: o.variantId })
				.dat(`${o.category.name}`)
				.up()
				.ele('cenaAkcijska')
				.txt(`${o.price}`)
				.up()
				.ele('nabavnaCena')
				.txt(`${o.price}`)
				.up()
				.ele('davcnaStopnja')
				.txt('25')
				.up()
				.ele('dobava', { id: 0 })
				.txt('na zalogi')
				.up()
				.ele('EAN')
				.txt(`${o.ean ? o.ean : ''}`)
				.up()
				.ele('brutoTeza')
				.txt(o.weight)
				.up()
				.ele('MPN')
				.txt(`${o.sku}`);
			itemImages();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedEnaa() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderEnaa(data);
		await this.saveFileToDisk(xmlMall, 'enaa');
		console.log(`enaa.xml zapisany.`);
	},
	async downloadMapping() {
		await downloadHandler(
			process.env.ENAA_CATEGORY_MAPPING,
			'../generate/enaa/',
			'enaa.csv'
		);
	},
};

const generateEnaa = async () => {
	try {
		await feedBuilder.downloadMapping();
		await feedBuilder.generateFeedEnaa();
	} catch (e) {
		console.log(e);
	}
};
export default generateEnaa;

// generateEnaa();
