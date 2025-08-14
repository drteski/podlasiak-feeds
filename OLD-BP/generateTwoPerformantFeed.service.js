import ObjectsToCsv from 'objects-to-csv-file';
import RO from '../models/RO.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateTwoPerformantFeed = async () => {
	const products = await RO.find();
	const productFeed = [];

	products.forEach((product) => {
		const {
			domain,
			title,
			description,
			price,
			category,
			url,
			variantId,
			brand,
			media,
			stock,
		} = product;
		if (domain !== 'Rea') return;
		if (description === '') return;
		productFeed.push({
			'': `${title === '' ? `""` : title}`,
			' ': `${description === '' ? `""` : description}`,
			'Short message': `""`,
			Price: `${price === '' ? `""` : price}`,
			Category: `${
				category[category.length - 1] === ''
					? `""`
					: category.length - 1
			}`,
			Subcategory: `""`,
			URL: `${url === '' ? `""` : url}`,
			'Image URL': `${media[0].url === '' ? `""` : media[0].url}`,
			'Product ID': `${variantId === '' ? `""` : variantId}`,
			'Generatirn text link': `0`,
			'Brand name': `${brand === '' ? `""` : brand}`,
			Availability: stock > 0 ? `1` : `0`,
			'Other data in JSON or YAML format': `""`,
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk('../generate/feed/2performant.csv', { delimiter: ',' });
	console.log('2performant.csv zapisany.');
};

export default generateTwoPerformantFeed;
