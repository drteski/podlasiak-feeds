import XmlStream from 'xml-stream';

import ObjectsToCsv from 'objects-to-csv-file';
import axios from 'axios';
import xml2js from 'xml2js';

const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });

const mapBasePrice = [
	{
		tariff: 1,
		strategy: 1,
		tax: 23,
	},
	{
		tariff: 37,
		strategy: 22,
		tax: 20,
	},
	{
		tariff: 35,
		strategy: 21,
		tax: 21,
	},
	{
		tariff: 25,
		strategy: 12,
		tax: 20,
	},
	{
		tariff: 31,
		strategy: 17,
		tax: 25,
	},
	{
		tariff: 39,
		strategy: 20,
		tax: 21,
	},
	{
		tariff: 5,
		strategy: 5,
		tax: 21,
	},
	{
		tariff: 47,
		strategy: 26,
		tax: 20,
	},
	{
		tariff: 53,
		strategy: 31,
		tax: 24,
	},
	{
		tariff: 13,
		strategy: 6,
		tax: 20,
	},
	{
		tariff: 55,
		strategy: 32,
		tax: 24,
	},
	{
		tariff: 29,
		strategy: 14,
		tax: 21,
	},
	{
		tariff: 33,
		strategy: 18,
		tax: 21,
	},
	{
		tariff: 43,
		strategy: 24,
		tax: 23,
	},
	{
		tariff: 15,
		strategy: 7,
		tax: 21,
	},
	{
		tariff: 49,
		strategy: 27,
		tax: 21,
	},
	{
		tariff: 11,
		strategy: 3,
		tax: 19,
	},
	{
		tariff: 51,
		strategy: 30,
		tax: 23,
	},
	{
		tariff: 17,
		strategy: 4,
		tax: 20,
	},
	{
		tariff: 19,
		strategy: 8,
		tax: 19,
	},
	{
		tariff: 41,
		strategy: 23,
		tax: 20,
	},
	{
		tariff: 21,
		strategy: 9,
		tax: 20,
	},
	{
		tariff: 45,
		strategy: 25,
		tax: 22,
	},
	{
		tariff: 27,
		strategy: 13,
		tax: 20,
	},
	{
		tariff: 7,
		strategy: 10,
		tax: 27,
	},
	{
		tariff: 9,
		strategy: 2,
		tax: 20,
	},
	{
		tariff: 23,
		strategy: 11,
		tax: 22,
	},
	{
		tariff: 0,
		strategy: 29,
		tax: 0,
	},
];
const mapSellPrice = [
	{
		tariff: 2,
		strategy: 1,
		tax: 23,
	},
	{
		tariff: 38,
		strategy: 22,
		tax: 20,
	},
	{
		tariff: 36,
		strategy: 21,
		tax: 21,
	},
	{
		tariff: 26,
		strategy: 12,
		tax: 20,
	},
	{
		tariff: 32,
		strategy: 17,
		tax: 25,
	},
	{
		tariff: 40,
		strategy: 20,
		tax: 21,
	},
	{
		tariff: 6,
		strategy: 5,
		tax: 21,
	},
	{
		tariff: 48,
		strategy: 26,
		tax: 20,
	},
	{
		tariff: 54,
		strategy: 31,
		tax: 24,
	},
	{
		tariff: 14,
		strategy: 6,
		tax: 20,
	},
	{
		tariff: 56,
		strategy: 32,
		tax: 24,
	},
	{
		tariff: 30,
		strategy: 14,
		tax: 21,
	},
	{
		tariff: 34,
		strategy: 18,
		tax: 21,
	},
	{
		tariff: 44,
		strategy: 24,
		tax: 23,
	},
	{
		tariff: 16,
		strategy: 7,
		tax: 21,
	},
	{
		tariff: 50,
		strategy: 27,
		tax: 21,
	},
	{
		tariff: 12,
		strategy: 3,
		tax: 19,
	},
	{
		tariff: 52,
		strategy: 30,
		tax: 23,
	},
	{
		tariff: 18,
		strategy: 4,
		tax: 20,
	},
	{
		tariff: 20,
		strategy: 8,
		tax: 19,
	},
	{
		tariff: 42,
		strategy: 23,
		tax: 20,
	},
	{
		tariff: 22,
		strategy: 9,
		tax: 20,
	},
	{
		tariff: 46,
		strategy: 25,
		tax: 22,
	},
	{
		tariff: 28,
		strategy: 13,
		tax: 20,
	},
	{
		tariff: 8,
		strategy: 10,
		tax: 27,
	},
	{
		tariff: 10,
		strategy: 2,
		tax: 20,
	},
	{
		tariff: 24,
		strategy: 11,
		tax: 22,
	},
	{
		tariff: 0,
		strategy: 29,
		tax: 0,
	},
];

const aliases = [
	{ id: 4, name: 'tutumi' },
	{ id: 5, name: 'rea' },
	{ id: 6, name: 'default' },
	{ id: 7, name: 'allegro' },
	{
		id: 8,
		name: 'bluegarden',
	},
	{ id: 9, name: 'toolight' },
];

// 'https://lazienka-rea.com.pl/feed/generate/full_offer'
// 'https://files.lazienka-rea.com.pl/feed_2.xml'
const generateCandeluxCsv = async () => {
	const feedData = new Promise(async (resolve, reject) => {
		const data = await axios
			.get('https://files.lazienka-rea.com.pl/feed_3.xml', {
				timeout: 0,
				responseType: 'stream',
			})
			.then((res) => res.data)
			.catch((error) => error);

		const xmlFileWriteStream = new XmlStream(data);
		const parsedProductData = [];
		const parsedTaxonomyData = [];
		const parsedProducersData = [];
		const parsedAlisasesData = [];
		xmlFileWriteStream.preserve('product');
		xmlFileWriteStream.collect('aliases');
		xmlFileWriteStream.collect('images');
		xmlFileWriteStream.collect('basePrice');
		xmlFileWriteStream.collect('sellPrice');
		xmlFileWriteStream.collect('variant');
		xmlFileWriteStream.collect('variant > basePrice');
		xmlFileWriteStream.collect('variant > salePrice');

		xmlFileWriteStream.on('endElement: strategy', (item) => {
			parsedTaxonomyData.push({
				id: item.$.id,
				name: item.$.name,
				currency: item.$.currency,
			});
		});

		xmlFileWriteStream.on('endElement: producer', (item) =>
			parsedProducersData.push(item.$)
		);
		xmlFileWriteStream.on('endElement: alias', (item) =>
			parsedAlisasesData.push(item.$)
		);
		xmlFileWriteStream.on('endElement: product', (item) => {
			const producer = parsedProducersData
				.map((producer) => {
					if (!item.$.producer) return '';
					if (producer.id === item.$.producer) return producer.name;
				})
				.filter(Boolean);
			const basePrices = item.basePrice[0].$children.map((price) => {
				return {
					id: price.$.tariff_strategy,
					tax: price.$.tax,
					net: price.$.net,
					gross: price.$.gross,
				};
			});
			const sellPrices = item.sellPrice[0].$children.map((price) => {
				return {
					id: price.$.tariff_strategy,
					tax: price.$.tax,
					net: price.$.net,
					gross: price.$.gross,
				};
			});

			const name = item.titles.$children
				.map((title) => {
					if (title.$.lang === 'pl') return title.$children[0];
				})
				.filter(Boolean);
			const description = item.descriptions.$children
				.map((desc) => {
					if (desc.$.lang === 'pl') return desc.$children[0];
				})
				.filter(Boolean);
			const aliasesId =
				item.aliases[0].$children.length === 0
					? []
					: item.aliases[0].$children[0].split(';');

			const aliases = aliasesId
				.map((alias) => {
					const currentAliasId = parsedAlisasesData.findIndex(
						(parsedAlias) => parsedAlias.id === alias
					);
					return parsedAlisasesData[currentAliasId].name;
				})
				.filter(Boolean)
				.join('\n');

			const images = item.images[0].$children.map((image) => {
				return (
					'https://tutumi.pl/picture/fit-in/filters:quality(80)/' +
					image.$.url
				);
			});

			parsedProductData.push({
				id: item.$.id,
				aliases,
				active: item.$.active === 'true' ? 1 : 0,
				activeVariant: '',
				variantId: '',
				sku: '',
				ean: '',
				name: name.length === 0 ? '' : name[0],
				variantName: '',
				weight: item.$.weight,
				cenaPodstawowa: basePrices,
				cenaPromocyjna: sellPrices,
				stock: item.stockTotal.$children[0].$.quantity,
				producer: producer[0],
				description: description.length === 0 ? '' : description[0],
				images: images.join(';'),
			});
			item.variants.$children.forEach((child) => {
				const variantBasePrices = child.basePrice[0].$children.map(
					(price) => {
						return {
							id: price.$.tariff_strategy,
							tax: price.$.tax,
							net: price.$.net,
							gross: price.$.gross,
						};
					}
				);
				const variantSellPrices = child.sellPrice[0].$children.map(
					(price) => {
						return {
							id: price.$.tariff_strategy,
							tax: price.$.tax,
							net: price.$.net,
							gross: price.$.gross,
						};
					}
				);
				const variantName = child.optionName.$children
					.map((title) => {
						if (title.$.lang === 'pl') return title.$children[0];
					})
					.filter(Boolean);
				parsedProductData.push({
					id: item.$.id,
					aliases,
					active: item.$.active === 'true' ? 1 : 0,
					activeVariant: child.$.isActive === 'true' ? 1 : 0,
					variantId: child.$.id,
					sku: child.$.symbol,
					ean: child.$.ean,
					weight: item.$.weight,
					name: name.length === 0 ? '' : name[0],
					variantName: variantName.length === 0 ? '' : variantName[0],
					cenaPodstawowa: variantBasePrices,
					cenaPromocyjna: variantSellPrices,
					stock: child.stockTotal.$children[0].$.quantity,
					producer: producer[0],
					description: description.length === 0 ? '' : description[0],
					images: '',
				});
			});
		});

		xmlFileWriteStream.on('end', () => {
			resolve({
				taxonomy: parsedTaxonomyData,
				products: parsedProductData,
			});
		});
	});
	const feed = await feedData.then((res) => res);

	const productFeed = [];
	const variantFeed = [];
	feed.products.forEach((product) => {
		const {
			id,
			aliases,
			active,
			activeVariant,
			variantId,
			sku,
			ean,
			weight,
			name,
			variantName,
			cenaPodstawowa,
			cenaPromocyjna,
			stock,
			producer,
			description,
			images,
		} = product;

		const baseTaxonomy = feed.taxonomy.map((taxo) => {
			const tariff = mapBasePrice.filter(
				(price) => price.strategy === parseInt(taxo.id)
			)[0];
			return {
				id: parseInt(taxo.id),
				tariffId: tariff.tariff,
				name: taxo.name.replace('PLN', 'Polska'),
				currency: taxo.currency,
				tax: tariff.tax,
			};
		});
		const saleTaxonomy = feed.taxonomy.map((taxo) => {
			const tariff = mapSellPrice.filter(
				(price) => price.strategy === parseInt(taxo.id)
			)[0];
			return {
				id: parseInt(taxo.id),
				tariffId: tariff.tariff,
				name: taxo.name
					.replace('Podstawowa', 'Promocyjna')
					.replace('PLN', 'Polska'),
				currency: taxo.currency,
				tax: tariff.tax,
			};
		});

		const cenaPodstawowaNowa = baseTaxonomy.map((base) => {
			const priceIndex = cenaPodstawowa.findIndex(
				(podstawowa) => base.id === parseInt(podstawowa.id)
			);
			if (priceIndex === -1)
				return {
					id: base.tariffId,
					price: '',
					name: base.name,
					currency: base.currency,
					tax: base.tax,
				};
			return {
				id: base.tariffId,
				price: cenaPodstawowa[priceIndex].gross,
				name: base.name,
				currency: base.currency,
				tax: base.tax,
			};
		});
		const cenaPromocyjnaNowa = saleTaxonomy.map((base) => {
			const priceIndex = cenaPromocyjna.findIndex(
				(podstawowa) => base.id === parseInt(podstawowa.id)
			);
			if (priceIndex === -1)
				return {
					id: base.tariffId,
					price: '',
					name: base.name,
					currency: base.currency,
					tax: base.tax,
				};
			return {
				id: base.tariffId,
				price: cenaPromocyjna[priceIndex].gross,
				name: base.name,
				currency: base.currency,
				tax: base.tax,
			};
		});

		const prices = [...cenaPodstawowaNowa, ...cenaPromocyjnaNowa].sort(
			(a, b) => a.id - b.id
		);

		prices.forEach((price) => {
			productFeed.push({
				object_id: `${price.id}_${variantId === '' ? 'product' : 'variant'}_${id}`,
				tariff_id: price.id,
				tariff_name: price.name,
				item_type: variantId === '' ? 'product' : 'variant',
				item_vid: variantId,
				item_id: id,
				gross_price: parseFloat(price.price),
				tax_rate: price.tax,
				currency: price.currency,
			});
		});

		// if (variantId === '') {
		// 	prices.forEach((price) => {
		// 		if (
		// 			price.id === 5 ||
		// 			price.id === 6 ||
		// 			price.id === 21 ||
		// 			price.id === 22
		// 		)
		// 			productFeed.push({
		// 				object_id: `${price.id}_product_${id}`,
		// 				tariff_id: price.id,
		// 				tariff_name: price.name,
		// 				item_type: 'product',
		// 				item_vid: variantId,
		// 				item_id: id,
		// 				gross_price: price.price,
		// 				tax_rate: price.tax,
		// 				currency: price.currency,
		// 			});
		// 	});
		// } else {
		// 	prices.forEach((price) => {
		// 		if (
		// 			price.id === 5 ||
		// 			price.id === 6 ||
		// 			price.id === 21 ||
		// 			price.id === 22
		// 		)
		// 			variantFeed.push({
		// 				object_id: `${price.id}_variant_${variantId}`,
		// 				tariff_id: price.id,
		// 				tariff_name: price.name,
		// 				item_type: 'variant',
		// 				item_id: variantId,
		// 				gross_price: price.price,
		// 				tax_rate: price.tax,
		// 				currency: price.currency,
		// 			});
		// 	});
		// }
	});

	const products = new ObjectsToCsv(productFeed);
	const variants = new ObjectsToCsv(variantFeed);
	await products.toDisk(`../generate/feed/ceny-products.csv`, {
		delimiter: ',',
	});
	await variants.toDisk(`../generate/feed/ceny-variantss.csv`, {
		delimiter: ',',
	});
	console.log(`ceny-importer.csv zapisany.`);
};

export default generateCandeluxCsv;

generateCandeluxCsv();
