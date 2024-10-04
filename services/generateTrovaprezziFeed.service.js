import IT from '../models/IT.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';
import { fetchImgInfo } from '../utilities/getMedia.utility.js';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await IT.find();
		const data = [];
		products.forEach((product) => {
			const {
				domain,
				brand,
				title,
				stock,
				description,
				ean,
				sku,
				url,
				category,
				media,
				price,
				weight,
			} = product;
			if (category[0] === '---') return;
			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return { url, main };
			});
			if (domain !== 'Rea') return;
			if (stock < 5) return;

			return data.push({
				Name: title,
				Brand: brand,
				Description: description,
				OriginalPrice: price,
				Price: price,
				Code: sku,
				Link: url,
				Stock: stock,
				Categories: category.join(';'),
				ShippingCost: 0,
				PartNumber: sku,
				EanCode: !ean ? '' : ean,
				Weight: weight,
				media: filteredMedia,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async filterOutImages(data) {
		const filteredMedia = [];
		for (let i = 0; i < data.length; i++) {
			const images = await fetchImgInfo(data[i].media);
			if (images.length === 0) {
				return;
			}
			filteredMedia.push(data[i]);
		}
		return filteredMedia;
	},
	async feedBuliderTrovaprezzi(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('Products');
		obj.forEach((o) => {
			const itemFront = root
				.ele('Offer')
				.ele('Name')
				.txt(`${o.Name}`)
				.up()
				.ele('Brand')
				.txt(`${o.Brand}`)
				.up()
				.ele('Description')
				.txt(`${o.Description}`)
				.up()
				.ele('OriginalPrice')
				.txt(`${o.Price}`)
				.up()
				.ele('Price')
				.txt(`${o.Price}`)
				.up()
				.ele('Code')
				.txt(`${o.Code}`)
				.up()
				.ele('Link')
				.txt(`${o.Link}`)
				.up()
				.ele('Stock')
				.txt(`${o.Stock}`)
				.up()
				.ele('Categories')
				.txt(`${o.Categories}`)
				.up()
				.ele('ShippingCost')
				.txt(`${o.ShippingCost}`)
				.up()
				.ele('PartNumber')
				.txt(`${o.PartNumber}`)
				.up()
				.ele('EanCode')
				.txt(`${o.EanCode}`)
				.up()
				.ele('Weight')
				.txt(`${o.Weight}`)
				.up();

			const itemMiddle = () => {
				return o.media.forEach((media, index) => {
					if (index === 0)
						return itemFront.ele(`Image`).txt(`${media.url}`).up();
					if (index > 0)
						return itemFront
							.ele(`Image${index + 1}`)
							.txt(`${media.url}`)
							.up();
				});
			};

			itemMiddle();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedTrovaprezzi() {
		const data = await this.prepareData();
		const readyData = await this.filterOutImages(data);
		const xmlMall = await this.feedBuliderTrovaprezzi(readyData);
		await this.saveFileToDisk(xmlMall, 'trovaprezzi');
		console.log(`trovaprezzi.xml zapisany.`);
	},
};

const generateTrovaprezzi = async () => {
	try {
		await feedBuilder.generateFeedTrovaprezzi();
	} catch (e) {
		console.log(e);
	}
};
export default generateTrovaprezzi;
