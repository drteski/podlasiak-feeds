import SK from '../models/SK.js';
import builder from 'xmlbuilder2';
import csvtojson from 'csvtojson';
import dotenv from 'dotenv';
import downloadHandler from '../utilities/downloadCsv.utility.js';
import fs from 'fs';
import PL from '../models/PL.js';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await SK.find();
		const polishPrices = await PL.find();
		const data = [];
		const mapping = await csvtojson()
			.fromFile('../generate/mall/sk/google_sheets_mall_sk.csv')
			.then((json) => {
				return json;
			});

		const filterId = mapping.map((map) => parseInt(map.id));

		products.forEach((product) => {
			const {
				variantId,
				brand,
				title,
				stock,
				description,
				ean,
				media,
				attributes,
				weight,
			} = product;

			const polishPrice =
				polishPrices[
					polishPrices.findIndex(
						(price) => price.variantId === variantId
					)
				]?.price;

			if (data.some((dat) => dat.id === variantId)) return;
			if (filterId.findIndex((filter) => filter !== parseInt(variantId)))
				return;

			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return { url, main };
			});
			const filteredAttrs = attributes.map((attribute) => {
				const { name, value } = attribute;
				return { name, value };
			});

			const categoryId =
				mapping.findIndex((item) => parseInt(item.id) === variantId) ===
				-1
					? ''
					: mapping[
							mapping.findIndex(
								(item) => parseInt(item.id) === variantId
							)
					  ].categoryId;
			data.push({
				id: variantId,
				stage: 'live',
				categoryId,
				brandId: brand === 'Toolight' ? 'TOOLIGHT' : brand,
				title: title
					.replace(/(Rea )|(REA )|(rea )/gm, '')
					.replace('  ', ' '),
				stock,
				shortdesc: description.slice(0, description.indexOf('.')) + '.',
				longdesc: description.slice(0, 299) + '.',
				packageSize: 'smallbox',
				barcode: !ean ? '' : ean,
				price: (polishPrice * 1.4 * 0.22).toFixed(2),
				vat: 20,
				media: filteredMedia,
				dimensions: [{ weight }],
				freeDelivery: false,
				deliveryDelay: 0,
				attrs: filteredAttrs,
			});
		});
		const newData = data.filter(
			(item) => item.id === filterId[filterId.indexOf(item.id)]
		);
		return newData;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderMallSk(obj) {
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
			const atrs = () => {
				return o.attrs.map(
					(atr) =>
						`<li><strong>${atr.name}:</strong> ${atr.value}</li>`
				);
			};

			const itemFront = root
				.ele('ITEM')
				.ele('ID')
				.txt(`${o.id}`)
				.up()
				.ele('STAGE')
				.txt(`${o.stage}`)
				.up()
				.ele('BRAND_ID')
				.txt(`${o.brandId}`)
				.up()
				.ele('CATEGORY_ID')
				.txt(`${o.categoryId}`)
				.up()
				.ele('PRIORITY')
				.txt('1')
				.up()
				.ele('TITLE')
				.dat(`${o.title}`)
				.up()
				.ele('SHORTDESC')
				.dat(`${o.shortdesc.split(0, 199)}`)
				.up()
				.ele('LONGDESC')
				.dat(`${o.longdesc}<br/><ul>${atrs()}</ul>`)
				.up()
				.ele('PACKAGE_SIZE')
				.txt(`${o.packageSize}`)
				.up()
				.ele('BARCODE')
				.txt(`${o.barcode}`)
				.up()
				.ele('PRICE')
				.txt(`${o.price}`)
				.up()
				.ele('VAT')
				.txt(`${o.vat}`)
				.up();

			const itemMiddle = () => {
				return o.media.forEach((media) =>
					itemFront
						.ele('MEDIA')
						.ele('URL')
						.txt(`${media.url}`)
						.up()
						.ele('MAIN')
						.txt(`${media.main}`)
						.up()
						.up()
				);
			};

			itemMiddle();

			const itemEnd = itemFront
				.ele('DIMENSIONS')
				.ele('WEIGHT')
				.txt(`${o.dimensions[0].weight}`)
				.up()
				.up()
				.ele('FREE_DELIVERY')
				.txt(`${o.freeDelivery}`)
				.up()
				.ele('DELIVERY_DELAY')
				.txt(`${o.deliveryDelay}`);
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async feedBuliderMallSkAvail(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			.ele('AVAILABILITIES', {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				version: '1',
			});
		obj.forEach((o) => {
			const itemFront = root
				.ele('AVAILABILITY')
				.ele('ID')
				.txt(`${o.id}`)
				.up()
				.ele('IN_STOCK')
				.txt(`${o.stock}`)
				.up()
				.ele('ACTIVE')
				.txt(`${o.stock > 0 ? 'true' : 'false'}`)
				.up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedMallSk() {
		const data = await this.prepareData();
		const xmlMall = await feedBuilder.feedBuliderMallSk(data);
		await this.saveFileToDisk(xmlMall, 'mall_sk');
		console.log(`mall_sk.xml zapisany.`);
	},
	async generateFeedMallSkAvail() {
		const data = await this.prepareData();
		const xmlMallAvail = await feedBuilder.feedBuliderMallSkAvail(data);
		await this.saveFileToDisk(xmlMallAvail, 'mall_sk_avail');
		console.log(`mall_sk_avail.xml zapisany.`);
	},
	async downloadMapping() {
		await downloadHandler(
			process.env.MALL_SK_MAPPING,
			'../generate/mall/sk/',
			'google_sheets_mall_sk.csv'
		);
	},
};

const generateMallSkFeed = async () => {
	try {
		await feedBuilder.downloadMapping();
		await feedBuilder.generateFeedMallSk();
		await feedBuilder.generateFeedMallSkAvail();
	} catch (e) {
		console.log(e);
	}
};
export default generateMallSkFeed;
