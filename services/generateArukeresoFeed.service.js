import HU from '../models/HU.js';
import builder from 'xmlbuilder2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const feedBuilder = {
	async prepareData() {
		const products = await HU.find();
		const data = [];
		products.forEach((product) => {
			const {
				domain,
				variantId,
				brand,
				title,
				description,
				ean,
				sku,
				url,
				category,
				media,
				price,
			} = product;
			const filteredMedia = media.map((med) => {
				const { url, main } = med;
				return { url, main };
			});
			if (domain !== 'Rea') return;

			return data.push({
				Rendelesszam: variantId,
				Cikkszam: sku,
				Gyarto: brand,
				EAN: ean,
				Termeknev: title,
				Leiras: description,
				Ar: price,
				Nar: parseFloat((price / 1.27).toFixed(2)),
				Kategoria: category[category.length - 1],
				Fotolink: filteredMedia[0].url,
				Termeklink: url,
				SzallitasiIdo: '3 - 5 nap',
				SzallitasiKoltseg: 0,
			});
		});
		return data;
	},
	async saveFileToDisk(data, name) {
		fs.writeFileSync(`../generate/feed/${name}.xml`, data);
	},
	async feedBuliderArukereso(obj) {
		const root = builder
			.create({
				version: '1.0',
				encoding: 'UTF-8',
			})
			// .ele('Products', {
			// 	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			// 	version: '1',
			// })
			.ele('termeklista');
		obj.forEach((o) => {
			const itemFront = root
				.ele('termek')
				.ele('Rendelesszam')
				.dat(`${o.Rendelesszam}`)
				.up()
				.ele('Cikkszam')
				.dat(`${o.Cikkszam}`)
				.up()
				.ele('Gyarto')
				.dat(`${o.Gyarto}`)
				.up()
				.ele('EAN')
				.dat(`${o.EAN}`)
				.up()
				.ele('Termeknev')
				.dat(`${o.Termeknev}`)
				.up()
				.ele('Leiras')
				.dat(`${o.Leiras}`)
				.up()
				.ele('Ar')
				.dat(`${o.Ar}`)
				.up()
				.ele('Netto_ar')
				.dat(`${o.Nar}`)
				.up()
				.ele('Kategoria')
				.dat(`${o.Kategoria}`)
				.up()
				.ele('Fotolink')
				.dat(`${o.Fotolink}`)
				.up()
				.ele('Termeklink')
				.dat(`${o.Termeklink}`)
				.up()
				.ele('SzallitasiIdo')
				.dat(`${o.SzallitasiIdo}`)
				.up()
				.ele('SzallitasiKoltseg')
				.dat(`${o.SzallitasiKoltseg}`)
				.up();
		});

		return root.end({
			format: 'xml',
			prettyPrint: true,
		});
	},
	async generateFeedArukereso() {
		const data = await this.prepareData();
		const xmlMall = await this.feedBuliderArukereso(data);
		await this.saveFileToDisk(xmlMall, 'arukereso');
		console.log(`arukereso.xml zapisany.`);
	},
};

const generateArukereso = async () => {
	try {
		await feedBuilder.generateFeedArukereso();
	} catch (e) {
		console.log(e);
	}
};
export default generateArukereso;
