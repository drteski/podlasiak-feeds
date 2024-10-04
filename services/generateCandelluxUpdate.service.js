import xml2js from 'xml2js';
// import fs from 'fs';
import axios from 'axios';

import ObjectsToCsv from 'objects-to-csv-file';

const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });

const generateCandeluxUpdateCsv = async () => {
	const data = await axios
		.get(
			'https://candellux.com.pl/data/export/feed10004_126071ae2713ddf263a4396d.xml',
			{
				timeout: 0,
				responseType: 'text',
			}
		)
		.then((res) => res.data)
		.catch((error) => console.log(error));
	const parsedData = [];
	parserXML.parseString(data, async (error, result) =>
		parsedData.push(...result.oferta.produkt)
	);
	const productFeed = [];
	parsedData.forEach((product) => {
		const sku = product.ATTR.indeks;
		const priceGross = product.sugerowana_cena_detaliczna_brutto_PLN[0];
		const stock = product.stan_magazynowy[0]._;

		productFeed.push({
			Command: 'UPDATE',
			'Variant SKU': sku,
			'Variant Inventory Qty': stock,
			'Variant Price': priceGross,
			'Variant Compare At Price': priceGross,
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/candelux_update.csv`, {
		delimiter: ',',
	});
	console.log(`candelux_update.csv zapisany.`);
};

export default generateCandeluxUpdateCsv;
