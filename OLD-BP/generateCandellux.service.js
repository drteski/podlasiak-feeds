import xml2js from 'xml2js';
import axios from 'axios';

import ObjectsToCsv from 'objects-to-csv-file';

const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });

const generateCandeluxCsv = async () => {
	const data = await axios
		.get(
			'https://candellux.com.pl/data/export/feed10004_126071ae2713ddf263a4396d.xml',
			{
				timeout: 0,
				responseType: 'text',
			}
		)
		.then((res) => res.data)
		.catch((error) => error);
	if (data.code === 'ECONNRESET') return;

	const parsedData = [];
	parserXML.parseString(data, async (error, result) =>
		parsedData.push(...result.oferta.produkt)
	);
	const productFeed = [];
	parsedData.forEach((product) => {
		const sku = product.ATTR.indeks;
		const ean = product.ATTR.EAN;
		const title = product.nazwa_handlowa[0];
		const brand = product.producent[0];
		const weight = product.waga_gram[0];
		const color = !product.kolor ? '' : product.kolor[0];
		const category = !product.kategoria ? '' : product.kategoria[0];
		const material = !product.material ? '' : product.material[0];
		const energyClass = !product.klasa_energetyczna
			? ''
			: product.klasa_energetyczna[0];
		const integratedLightSource = !product.zawiera_zrodlo_swiatla
			? ''
			: product.zawiera_zrodlo_swiatla[0];
		const voltage = !product.napiecie_zasilania
			? ''
			: product.napiecie_zasilania[0];
		const isLED = !product.Led_zintegrowany
			? ''
			: product.Led_zintegrowany[0];
		const priceGross = product.sugerowana_cena_detaliczna_brutto_PLN[0];
		const stock = product.stan_magazynowy[0]._;
		const images = !product.zdjecia[0]
			? []
			: product.zdjecia[0].zdjecie.map((img) => img.zdj_url[0]);

		const attributes = [
			{ name: 'Materiał', value: material },
			{ name: 'Kolor', value: color },
			{
				name: 'Klasa energetyczna',
				value: energyClass,
			},
			{ name: 'Zawiera źródło światła', value: integratedLightSource },
			{ name: 'Napięcie zasilania', value: voltage },
			{ name: 'Led zintegrowany', value: isLED },
		];

		const attrs = attributes
			.map((attr) => {
				if (attr.value === 'N/D') return;
				return `<li><strong>${attr.name}:</strong> ${attr.value}</li>`;
			})
			.join('');

		productFeed.push({
			Handle: sku,
			Command: 'UPDATE',
			Vendor: brand,
			Title: title,
			Type: category,
			Tags: '',
			Published: true,
			'Option1 Name': 'Title',
			'Option1 Value': '',
			'Option2 Name': '',
			'Option2 Value': '',
			'Option3 Name': '',
			'Option3 Value': '',
			'Variant SKU': sku,
			'Variant Grams': parseFloat(weight),
			'Variant Inventory Tracker': 'shopify',
			'Variant Inventory Qty': parseFloat(stock),
			'Variant Inventory Policy': 'deny',
			'Variant Fulfillment Service': 'manual',
			'Variant Price': Math.ceil(parseFloat(priceGross) * 0.95),
			'Variant Compare At Price': priceGross,
			'Variant Requires Shipping': 'TRUE',
			'Variant Taxable': 'TRUE',
			'Variant Barcode': ean,
			'Image Src': images[0],
			'Image Command': 'MERGE',
			'Image Position': 1,
			'Image Alt Text': '',
			'SEO Title': title,
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
			'Variant Weight Unit': 'kg',
			'Variant Tax Code': '',
			'Cost per item': '',

			'Metafield: custom.product_details [single_line_text_field]': `<ul style='list-style: none!important;'>${attrs}</ul>`,
			'Metafield: custom.second_image [single_line_text_field]':
				!images[1] ? '' : `<img src='${images[1]}' alt=''>`,
			'Metafield: custom.third_image [single_line_text_field]': !images[2]
				? ''
				: `<img src='${images[2]}' alt=''>`,
		});
		images.forEach((med, index) => {
			if (index === 0) return;
			return productFeed.push({
				Handle: sku,
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
	await csv.toDisk(`../generate/feed/candelux.csv`, {
		delimiter: ',',
	});
	console.log(`candelux.csv zapisany.`);
};

export default generateCandeluxCsv;

// generateCandeluxCsv();
