import dotenv from 'dotenv';
import ObjectsToCsv from 'objects-to-csv-file';
import mongoose from 'mongoose';
import PL from '../models/PL.js';
import csvtojson from 'csvtojson';

dotenv.config({ path: '../.env' });

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 10000,
});
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => {
	console.log('Połączono z DB');
});

const generatePriceMapping = async () => {
	const merce = await csvtojson({ delimiter: '\t' }).fromFile(
		'../generate/products.csv'
	);
	const prepMerc = merce.map((product) => {
		return {
			id: product['#'],
			name: product['Nazwa produktu'],
			variant: product.Opcja,
			priceGross: product['Cena brutto'],
			brand: product.Producent,
			weight: product.Waga,
		};
	});
	const products = await PL.find();
	const productFeed = [];

	prepMerc.forEach((merceItem) => {
		const { id, name, variant, priceGross, brand, weight } = merceItem;
		if (name.match(/allegro/gi)) return;
		if (brand === 'Rea') return;
		if (brand === 'Toolight') return;
		if (brand === 'Spectrum LED') return;

		const variants = products.filter((prod) => {
			if (prod.id === parseInt(id)) return prod;
		});
		const currentVariant = variants.findIndex(
			(item) => item.attributes[0]?.value === variant
		);

		productFeed.push({
			id,
			name,
			variant,
			priceGross,
			brand,
			weight,
			feedId: currentVariant === -1 ? '' : variants[currentVariant].id,
			feedVariantId:
				currentVariant === -1 ? '' : variants[currentVariant].variantId,
			feedName:
				currentVariant === -1 ? '' : variants[currentVariant].title,
			feedPrice:
				currentVariant === -1 ? '' : variants[currentVariant].price,
		});
	});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/mapping.csv`, {
		delimiter: ',',
	});
	console.log(`mapping.csv zapisany.`);
};

export default generatePriceMapping;

generatePriceMapping();
