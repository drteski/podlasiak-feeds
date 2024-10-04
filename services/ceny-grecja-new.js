import fs from 'fs';
import ObjectsToCsv from 'objects-to-csv-file';
import { tariff } from '../data/tariff.js';

const dataPath = `${process.cwd().replace(/\\\\/g, '/')}/public/temp/data/`;

const generateNewPricesFile = async () => {
	const files = fs.readdirSync('../public/temp/data/');
	const productsFiles = files.filter((file) => file.match(/product-\d*/g));

	const processProducers = () => {
		const producersData = fs.readFileSync(
			'../public/temp/data/producers.json',
			'utf8'
		);

		return JSON.parse(producersData).producer.map((producer) => {
			return {
				id: parseInt(producer.$id),
				name: producer.$name,
			};
		});
	};
	const processProducts = () => {
		const allProducts = [];
		productsFiles.forEach((file) => {
			const data = fs.readFileSync(`../public/temp/data/${file}`, 'utf8');
			allProducts.push(...JSON.parse(data));
		});
		return allProducts;
	};
	const producers = processProducers();
	const products = processProducts();

	const productToExport = () => {
		const preparedProducts = [];

		products.forEach((product) => {
			const producerId = producers.findIndex(
				(p) => p.id === parseInt(product.$producer)
			);

			const images = (data) => {
				if (data.length !== 0) {
					if (data.image.length === undefined) {
						return [
							`https://tutumi.pl/picture/fit-in/filters:quality(80)/${data.image.$url}`,
						];
					} else {
						return data.image.map(
							(img) =>
								`https://tutumi.pl/picture/fit-in/filters:quality(80)/${img.$url}`
						);
					}
					return [];
				}
				return [];
			};
			const prices = (data) => {
				const preparedPrices = [];
				if (data.length !== 0) {
					if (data.price.length !== undefined) {
						preparedPrices.push(
							...data.price.map((price) => ({
								tariff: parseInt(price.$tariff_strategy),
								tax: parseInt(price.$tax),
								price: parseFloat(price.$gross),
							}))
						);
					} else {
						preparedPrices.push({
							tariff: parseInt(data.price.$tariff_strategy),
							tax: parseInt(data.price.$tax),
							price: parseFloat(data.price.$gross),
						});
					}
				}
				return tariff
					.map((tar) => {
						const priceId = preparedPrices.findIndex(
							(price) => price.tariff === tar.tariff
						);
						if (priceId !== -1) {
							return {
								tariff: tar.tariff,
								tax: tar.tax,
								price: preparedPrices[priceId].price,
								currency: tar.currency,
								lang: tar.lang,
							};
						}
						return {
							tariff: tar.tariff,
							tax: tar.tax,
							price: '',
							currency: tar.currency,
							lang: tar.lang,
						};
					})
					.reduce((prev, curr) => {
						return {
							...prev,
							[`${curr.lang}_${curr.tariff}_${curr.currency}_${curr.tax}`]:
								curr.price,
						};
					}, {});
			};

			const variants = () => {
				if (product.variants.variant.length === undefined) {
					const variantNameIndex =
						product.variants.variant.optionName.name.findIndex(
							(n) => n.$lang === 'pl'
						);
					preparedProducts.push({
						id: product.$id,
						active: product.$active === 'true' ? 1 : 0,
						variantId: product.variants.variant.$id,
						activeVariant:
							product.variants.variant.$isActive === 'true'
								? 1
								: 0,
						sku: product.variants.variant.$symbol,
						ean: product.variants.variant.$ean,
						weight: product.$weight,
						title: product.titles.title.filter(
							(t) => t.$lang === 'pl'
						)[0].$,
						variantName:
							product.variants.variant.optionName.name[
								variantNameIndex
							].$,
						stock: product.variants.variant.stockTotal.stock[0]
							.$quantity,
						producer:
							producerId !== -1 ? producers[producerId].name : '',
						description: product.descriptions.description.filter(
							(d) => d.$lang === 'pl'
						)[0].$,
						images: images(product.images).join(';'),
						...prices(product.variants.variant.basePrice),
					});
				} else {
					product.variants.variant.forEach((variant) => {
						const variantNameIndex =
							variant.optionName.name.findIndex(
								(n) => n.$lang === 'pl'
							);
						preparedProducts.push({
							id: product.$id,
							active: product.$active === 'true' ? 1 : 0,
							variantId: variant.$id,
							activeVariant: variant.$isActive === 'true' ? 1 : 0,
							sku: variant.$symbol,
							ean: variant.$ean,
							weight: product.$weight,
							title: product.titles.title.filter(
								(t) => t.$lang === 'pl'
							)[0].$,
							variantName:
								variant.optionName.name[variantNameIndex].$,
							stock: variant.stockTotal.stock[0].$quantity,
							producer:
								producerId !== -1
									? producers[producerId].name
									: '',
							description:
								product.descriptions.description.filter(
									(d) => d.$lang === 'pl'
								)[0].$,
							images: images(product.images).join(';'),
							...prices(variant.basePrice),
						});
					});
				}
			};
			preparedProducts.push({
				id: product.$id,
				active: product.$active === 'true' ? 1 : 0,
				variantId: '',
				activeVariant: 0,
				sku: '',
				ean: '',
				weight: product.$weight,
				title: product.titles.title.filter((t) => t.$lang === 'pl')[0]
					.$,
				variantName: '',
				stock: product.stockTotal.stock[0].$quantity,
				producer: producerId !== -1 ? producers[producerId].name : '',
				description: product.descriptions.description.filter(
					(d) => d.$lang === 'pl'
				)[0].$,
				images: images(product.images).join(';'),
				...prices(product.basePrice),
			});
			variants();
		});
		return preparedProducts;
	};

	// const tosave = productToExport().filter((prod) => {
	// 	if (prod.active === 1 && prod.activeVariant === 1) return prod;
	// });
	const csv = new ObjectsToCsv(productToExport());
	await csv.toDisk(`../generate/feed/ceny-nowe-klaudia.csv`, {
		delimiter: ',',
	});
	console.log(`ceny-nowe-klaudia.csv zapisany.`);
};

export default generateNewPricesFile;

generateNewPricesFile();
