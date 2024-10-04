import xml2js from 'xml2js';
// import fs from 'fs';
import axios from 'axios';

import ObjectsToCsv from 'objects-to-csv-file';

const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });

const generateAquaPlanetCsv = async () => {
	const data = await axios
		.get(
			'http://aquaplanet.redcart.pl/export/16475ffaafbbd7374bcd5a8d74c5d8a2.xml',
			{
				timeout: 0,
				responseType: 'text',
			}
		)
		.then((res) => res.data)
		.catch((error) => console.log(error));

	const parsedData = [];
	parserXML.parseString(data, async (error, result) => {
		const parsed = result.redcart.redcart.map((res) => {
			const {
				id,
				nazwa,
				urlzdjecie,
				skroconyopis,
				pelnyopis,
				cenanetto,
				cenabrutto,
				podatekvat,
				stan,
				waga,
				producent,
				symbol,
				status,
				cat_path,
				ean,
				cenadetaliczna,
				opcje,
			} = res;
			return {
				id: id[0],
				nazwa: nazwa[0],
				urlzdjecie: urlzdjecie[0].split('*'),
				skroconyopis: skroconyopis[0],
				pelnyopis: pelnyopis[0],
				cenanetto: cenanetto[0],
				cenabrutto: cenabrutto[0],
				podatekvat: podatekvat[0],
				stan: stan[0],
				waga: waga[0],
				producent: producent[0],
				symbol: symbol[0],
				status: status[0],
				cat_path: cat_path[0],
				ean: ean[0],
				cenadetaliczna: cenadetaliczna[0],
				opcje: opcje[0],
			};
		});

		parsedData.push(...parsed);
	});
	const productFeed = [];
	parsedData.forEach((product) => {
		const {
			id,
			nazwa,
			urlzdjecie,
			skroconyopis,
			pelnyopis,
			cenanetto,
			cenabrutto,
			podatekvat,
			stan,
			waga,
			producent,
			symbol,
			status,
			cat_path,
			ean,
			cenadetaliczna,
			opcje,
		} = product;

		productFeed.push({
			Handle: id,
			Command: 'UPDATE',
			Vendor: producent,
			Title: nazwa,
			Type: cat_path.replace('/', ' > '),
			Tags: '',
			Published: true,
			'Option1 Name': 'Title',
			'Option1 Value': '',
			'Option2 Name': '',
			'Option2 Value': '',
			'Option3 Name': '',
			'Option3 Value': '',
			'Variant SKU': symbol,
			'Variant Grams': parseFloat(waga) * 1000,
			'Variant Inventory Tracker': 'shopify',
			'Variant Inventory Qty': parseFloat(stan),
			'Variant Inventory Policy': 'deny',
			'Variant Fulfillment Service': 'manual',
			'Variant Price': Math.ceil(parseFloat(cenadetaliczna) * 0.95),
			'Variant Compare At Price': parseFloat(cenadetaliczna),
			'Variant Requires Shipping': 'TRUE',
			'Variant Taxable': 'TRUE',
			'Variant Barcode': ean,
			'Image Src': urlzdjecie[0],
			'Image Command': 'MERGE',
			'Image Position': 1,
			'Image Alt Text': '',
			'SEO Title': nazwa,
			'SEO Description': skroconyopis,
			'Google Shopping / Google Product Category': '',
			'Google Shopping / Gender': '',
			'Google Shopping / Age Group': '',
			'Google Shopping / MPN': '',
			'Google Shopping / AdWords Grouping': '',
			'Google Shopping / AdWords Labels': '',
			'Google Shopping / Condition': '',
			'Google Shopping / Custom Product': '',
			'Google Shopping / Custom Label 0': '',
			'Google Shopping / Custom Label 1': '',
			'Google Shopping / Custom Label 2': '',
			'Google Shopping / Custom Label 3': '',
			'Google Shopping / Custom Label 4': '',
			'Variant Weight Unit': 'kg',
			'Variant Tax Code': '',
			'Cost per item': '',

			'Metafield: custom.product_details [single_line_text_field]': '',
			'Metafield: custom.second_image [single_line_text_field]':
				!urlzdjecie[1] ? '' : `<img src='${urlzdjecie[1]}' alt=''>`,
			'Metafield: custom.third_image [single_line_text_field]':
				!urlzdjecie[2] ? '' : `<img src='${urlzdjecie[2]}' alt=''>`,
		});
		urlzdjecie.forEach((med, index) => {
			if (index === 0) return;
			return productFeed.push({
				Handle: id,
				Command: '',
				Vendor: '',
				Title: '',
				Type: '',
				Tags: '',
				Published: '',
				'Option1 Name': '',
				'Option1 Value': '',
				'Option2 Name': '',
				'Option2 Value': '',
				'Option3 Name': '',
				'Option3 Value': '',
				'Variant SKU': '',
				'Variant Grams': '',
				'Variant Inventory Tracker': '',
				'Variant Inventory Qty': '',
				'Variant Inventory Policy': '',
				'Variant Fulfillment Service': '',
				'Variant Price': '',
				'Variant Compare At Price': '',
				'Variant Requires Shipping': '',
				'Variant Taxable': '',
				'Variant Barcode': '',
				'Image Src': med,
				'Image Command': 'MERGE',
				'Image Position': index + 1,
				'Image Alt Text': '',
				'SEO Title': '',
				'SEO Description': '',
				'Google Shopping / Google Product Category': '',
				'Google Shopping / Gender': '',
				'Google Shopping / Age Group': '',
				'Google Shopping / MPN': '',
				'Google Shopping / AdWords Grouping': '',
				'Google Shopping / AdWords Labels': '',
				'Google Shopping / Condition': '',
				'Google Shopping / Custom Product': '',
				'Google Shopping / Custom Label 0': '',
				'Google Shopping / Custom Label 1': '',
				'Google Shopping / Custom Label 2': '',
				'Google Shopping / Custom Label 3': '',
				'Google Shopping / Custom Label 4': '',
				'Variant Weight Unit': '',
				'Variant Tax Code': '',
				'Cost per item': '',
				'Metafield: custom.product_details [single_line_text_field]':
					'',
				'Metafield: custom.second_image [single_line_text_field]': '',
				'Metafield: custom.third_image [single_line_text_field]': '',
			});
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/aquaplanet.csv`, {
		delimiter: ',',
	});
	console.log(`aquaplanet.csv zapisany.`);
};

export default generateAquaPlanetCsv;

// generateAquaPlanetCsv();
