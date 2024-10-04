import PL from '../models/PL.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import timeStamp from 'time-stamp';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await PL.find();
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
				brand,
				stock,
				price,
				weight,
				attributes,
				media,
			} = product;

			if (domain !== 'Rea') return;

			const mapProducer = (data) => {
				switch (data) {
					case 'Rea':
						return {
							producer: 'REA',
							id: 1308137280,
						};
						break;
					case 'Toolight':
						return {
							producer: 'Toolight',
							id: 1308137278,
						};
						break;
					case 'Tutumi':
						return {
							producer: 'Tutumi',
							id: 1308137277,
						};
					case 'Bluegarden':
						return {
							producer: 'Bluegarden',
							id: 1652450069,
						};
						break;
					default:
						console.log(`brak producenta`);
				}
			};

			const filteredMedia = media.map((med, index) => {
				const { url } = med;
				// imageSize(url, async (err, dim) => {
				// 	console.log(dim.width, dim.height);
				// });

				return {
					url,
					priority: index + 1,
				};
			});

			const joinTitle = (data) => {
				if (!attributes[0] || attributes[0].value === '---')
					return data;
				return `${data} ${attributes[0].value}`;
			};

			const specification = attributes
				.map((attr) => `${attr.name}: ${attr.value}`)
				.join(' ');

			const calculatedPrice = (data) => {
				const gross = data.toFixed(2);
				const net = (data / 1.23).toFixed(2);
				return {
					gross,
					net,
				};
			};

			return data.push({
				variantId,
				brand: mapProducer(brand),
				title: joinTitle(title),
				description,
				price: calculatedPrice(price),
				weight: weight * 1000,
				sku,
				ean,
				stock,
				available: stock > 0 ? 'in_stock' : 'unavailable',
				images: filteredMedia,
				attributes,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderIdoSell(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('offer', {
				file_format: 'IOF',
				generated: timeStamp('YYYY-MM-DD HH:mm:ss'),
				'iaiext:currency': 'PLN',
				'xmlns:iof': 'http://www.iai-shop.com/developers/iof.phtml',
				version: '3.0',
				extensions: 'yes',
				'xmlns:iaiext':
					'http://www.iai-shop.com/developers/iof/extensions.phtml',
			})
			.ele('products', { language: 'pol' });
		obj.forEach((o) => {
			const itemFront = root
				.ele('product', {
					id: o.variantId,
					currency: 'PLN',
					producer_code_standard: 'GTIN13',
					type: 'regular',
					vat: '23',
					'iaiext:product_free': 'n',
					'iaiext:save_serial_numbers': 'na',
					'iaiext:available': 'yes',
					site: '4',
				})
				.ele('producer', {
					id: o.brand.id,
					name: o.brand.producer,
				})
				.up()
				.ele('unit', { id: '0', 'xml:lang': 'pol', name: 'szt.' })
				.up()
				.ele('description')
				.ele('name', { 'xml:lang': 'pol' })
				.dat(`${o.title}`)
				.up()
				.ele('long_desc', { 'xml:lang': 'pol' })
				.dat(`${o.description}`)
				.up()
				.up()
				.ele('price', { gross: o.price.gross, net: o.price.net })
				.up()
				.ele('srp', { gross: '0.00', net: '0.00' })
				.up()
				.ele('sizes', {
					'iaiext:group_name': 'Grupa one size',
					'iaiext:group_id': '-1',
					'iaiext:sizeList': 'Full',
				})
				.ele('size', {
					id: 'uniw',
					name: 'one size',
					panel_name: 'one size',
					code: `${o.variantId}-uniw`,
					weight: o.weight,
					'iaiext:weight': '0',
					code_producer: o.ean,
					'iaiext:code_external': o.sku,
					available: o.available,
				})
				.ele('price', { gross: o.price.gross, net: o.price.net })
				.up()
				.ele('srp', { gross: '0.00', net: '0.00' })
				.up()
				.ele('stock', {
					id: '1',
					quantity: `${o.stock}.000`,
					available_stock_quantity: o.stock,
				})
				.up()
				.up()
				.ele('images')
				.ele('large');
			const itemMiddle = () => {
				return o.images.forEach((img) => {
					return itemFront
						.ele('image', {
							'iaiext:priority': img.priority,
							url: img.url,
							width: 'auto',
							height: 'auto',
						})
						.up()
						.up();
				});
			};

			itemMiddle();

			const nextItems = itemFront
				.up()
				.ele('icons')
				.ele('icon', {
					'iaiext:priority': '1',
					url: o.images[0].url,
					width: '350',
					height: '350',
				})
				.up()
				.up()
				.ele('parameters');
			const populateParameters = () => {
				return o.attributes.forEach((attribute, index) => {
					if (
						attribute.name === 'Wariant opcji' ||
						attribute.name === 'Informacja o dostawie' ||
						attribute.name === 'Gwarancja'
					)
						return;
					return nextItems
						.ele('parameter', {
							type: 'parameter',
							name: attribute.name,
							'xml:lang': 'pol',
							distinction: 'n',
							group_distinction: 'n',
							hide: 'n',
							auction_template_hide: 'n',
							priority: index + 1,
						})
						.ele('value', {
							name: attribute.value,
							'xml:lang': 'pol',
							priority: index + 1,
						})
						.up()
						.up();
				});
			};
			populateParameters();
			nextItems.up().up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedIdoSell() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderIdoSell(data);
		await this.saveFileToDisk(xmlMall, 'idosell_full');
		console.log(`idosell_full.xml zapisany.`);
	},
};

const generateIdoSell = async () => {
	try {
		await feedBuilder.generateFeedIdoSell();
	} catch (e) {
		console.log(e);
	}
};

export default generateIdoSell;
