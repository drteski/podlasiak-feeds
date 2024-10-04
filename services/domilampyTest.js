import ObjectsToCsv from 'objects-to-csv-file';
import { domilampy } from '../data/domilampyDrop.js';

const generateJanekDomilampyCsv = async () => {
	const products = domilampy;
	if (products === null) return;
	const productFeed = [];
	products.forEach((product) => {
		const {
			title,
			sku,
			ean,
			type,
			variable_height,
			material,
			color,
			shade_color,
			shade_diameter,
			width,
			length,
			weight,
			ligth_sources,
			plug,
			max_power,
			waterproof,
			description,
			price_gross,
			img1,
			img2,
			img3,
			img4,
			img5,
			img6,
			img7,
			img8,
			img9,
			img10,
			img11,
		} = product;
		const brand = 'Emibig';
		const media = [
			img1,
			img2,
			img3,
			img4,
			img5,
			img6,
			img7,
			img8,
			img9,
			img10,
			img11,
		].filter(Boolean);
		const attributes = [
			{ name: 'Materiał', value: material },
			{ name: 'Kolor', value: color },
			{ name: 'Kolor klosza', value: shade_color },
			{
				name: 'Średnica klosza',
				value: shade_diameter,
			},
			{ name: 'Punkty światła', value: ligth_sources },
			{ name: 'Zmienna wysokość', value: variable_height },
			{ name: 'Szerokość', value: width },
			{ name: 'Długość', value: length },
			{ name: 'Waga', value: weight },
			{ name: 'Gwint', value: plug },
			{ name: 'Moc maksymalna', value: max_power },
			{ name: 'Szczelność', value: waterproof },
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
			'Variant Inventory Qty': 10000,
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/janek_domilampy.csv`, {
		delimiter: ',',
	});
	console.log(`janek_domilampy.csv zapisany.`);
};

export default generateJanekDomilampyCsv;

// generateJanekDomilampyCsv();
