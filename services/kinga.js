import ObjectsToCsv from 'objects-to-csv-file';
import axios from 'axios';
import xml2js from 'xml2js';

const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });

const generateCandeluxCsv = async () => {
	const data = await axios
		.get('https://files.lazienka-rea.com.pl/zlew_ceneo.xml', {
			timeout: 0,
			responseType: 'text',
		})
		.then((res) => res.data)
		.catch((error) => error);
	if (data.code === 'ECONNRESET') return;

	const parsedData = [];
	parserXML.parseString(data, async (error, result) =>
		parsedData.push(...result.offers.group[0].o)
	);
	const productFeed = [];
	parsedData.forEach((product, index) => {
		if (index === 4) console.log(product);
		const attributes = product.attrs[0].a
			.map((item) => {
				if (item._ === undefined) return;
				return { name: item.ATTR.name, value: item._ };
			})
			.filter(Boolean);
		console.log(attributes);
		const images = [];
		for (const [key, value] of Object.entries(product.imgs[0])) {
			images.push(value[0].ATTR.url);
		}

		const name = product.name[0];
		const url = product.ATTR.url;
		const id = product.ATTR.id;
		const price = product.ATTR.price;
		const stock = product.ATTR.stock;
		const weight = product.ATTR.weight;
		const desc = product.desc ? product.desc[0] : '';

		// console.log(name, url, price, stock, weight, desc);
		productFeed.push({
			id,
			name,
			price,
			stock,
			weight,
			url,
			images: images.join(';'),
			attributes: attributes
				.map((attr) => `${attr.name}: ${attr.value}\n`)
				.join(''),
			desc,
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/kinga.csv`, {
		delimiter: ',',
	});
	console.log(`kinga.csv zapisany.`);
};

export default generateCandeluxCsv;

generateCandeluxCsv();
