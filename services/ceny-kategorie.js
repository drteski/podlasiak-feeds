import XmlStream from 'xml-stream';

import ObjectsToCsv from 'objects-to-csv-file';
import axios from 'axios';
import { createWriteStream } from 'fs';
import eol from 'eol';
import xml2js from 'xml2js';
import { XMLParser } from 'fast-xml-parser';
import { request } from 'https';

const parserXML = new xml2js.Parser({ attrkey: 'ATTR' });

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
			.get('https://files.lazienka-rea.com.pl/feed-small.xml', {
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
		const parsedCategoriesData = [];

		xmlFileWriteStream.preserve('product');
		xmlFileWriteStream.collect('aliases');
		// xmlFileWriteStream.collect('categories');
		// xmlFileWriteStream.collect('category');
		xmlFileWriteStream.collect('name');
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
		xmlFileWriteStream.on('endElement: category', (item) => {
			parsedCategoriesData.push({
				categoryId: item.$.id,
				text: item.name.reduce((prev, curr) => {
					return { [`${curr.$.lang}`]: curr.$text, ...prev };
				}, {}),
				parentCategoryId: item.$.parent,
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

			const namePL = item.titles.$children
				.map((title) => {
					if (title.$.lang === 'pl') return title.$children[0];
				})
				.filter(Boolean);
			const namePT = item.titles.$children
				.map((title) => {
					if (title.$.lang === 'es') return title.$children[0];
				})
				.filter(Boolean);
			const descriptionPL = item.descriptions.$children
				.map((desc) => {
					if (desc.$.lang === 'pl') return desc.$children[0];
				})
				.filter(Boolean);
			const descriptionPT = item.descriptions.$children
				.map((desc) => {
					if (desc.$.lang === 'es') return desc.$children[0];
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
				.join(',');

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
				namePL: namePL.length === 0 ? '' : namePL[0],
				namePT: namePT.length === 0 ? '' : namePT[0],
				variantName: '',
				weight: item.$.weight,
				cenaPodstawowa: basePrices,
				cenaPromocyjna: sellPrices,
				stock: item.stockTotal.$children[0].$.quantity,
				producer: producer[0],
				descriptionPL:
					descriptionPL.length === 0 ? '' : descriptionPL[0],
				descriptionPT:
					descriptionPT.length === 0 ? '' : descriptionPT[0],
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
						// console.log(title.$);
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
					namePL: namePL.length === 0 ? '' : namePL[0],
					namePT: namePT.length === 0 ? '' : namePT[0],
					variantName: variantName.length === 0 ? '' : variantName[0],
					cenaPodstawowa: variantBasePrices,
					cenaPromocyjna: variantSellPrices,
					stock: child.stockTotal.$children[0].$.quantity,
					producer: producer[0],
					descriptionPL:
						descriptionPL.length === 0 ? '' : descriptionPL[0],
					descriptionPT:
						descriptionPT.length === 0 ? '' : descriptionPT[0],
					images: images.join(';'),
				});
			});
		});

		xmlFileWriteStream.on('end', () => {
			return resolve({
				taxonomy: parsedTaxonomyData,
				products: parsedProductData,
				// categories: parsedCategoriesData,
			});
		});
	});
	const feed = await feedData.then((res) => res);
	console.log(feed);

	// const productFeed = [];
	// const categoriesData = feed.categories.map((dat) => ({
	// 	categoryId: dat.categoryId,
	// 	parentCategoryId: dat.parentCategoryId,
	// 	...dat.text,
	// }));
	// feed.products.forEach((product) => {
	// 	const {
	// 		id,
	// 		aliases,
	// 		active,
	// 		activeVariant,
	// 		variantId,
	// 		sku,
	// 		ean,
	// 		weight,
	// 		namePL,
	// 		namePT,
	// 		variantName,
	// 		cenaPodstawowa,
	// 		cenaPromocyjna,
	// 		stock,
	// 		producer,
	// 		descriptionPL,
	// 		descriptionPT,
	// 		images,
	// 	} = product;
	// 	const baseTaxonomy = feed.taxonomy.map((taxo) => {
	// 		return {
	// 			id: taxo.id,
	// 			name: `${taxo.id}_${taxo.name}_${taxo.currency}`,
	// 		};
	// 	});
	// 	const saleTaxonomy = feed.taxonomy.map((taxo) => {
	// 		return {
	// 			id: taxo.id,
	// 			name: `${taxo.id}_${taxo.name.replace(
	// 				'Podstawowa',
	// 				'Promocyjna'
	// 			)}_${taxo.currency}`,
	// 		};
	// 	});
	//
	// 	const cenaPodstawowaNowa = baseTaxonomy.map((base) => {
	// 		const priceIndex = cenaPodstawowa.findIndex(
	// 			(podstawowa) => base.id === podstawowa.id
	// 		);
	// 		if (priceIndex === -1)
	// 			return { id: base.id, price: '', name: base.name };
	// 		return {
	// 			id: base.id,
	// 			price: cenaPodstawowa[priceIndex].gross,
	// 			name: base.name,
	// 		};
	// 	});
	//
	// 	const cenaPromocyjnaNowa = saleTaxonomy.map((base) => {
	// 		const priceIndex = cenaPromocyjna.findIndex(
	// 			(podstawowa) => base.id === podstawowa.id
	// 		);
	// 		if (priceIndex === -1)
	// 			return { id: base.id, price: '', name: base.name };
	// 		return {
	// 			id: base.id,
	// 			price: cenaPromocyjna[priceIndex].gross,
	// 			name: base.name,
	// 		};
	// 	});
	// 	const prices = [...cenaPodstawowaNowa, ...cenaPromocyjnaNowa].sort(
	// 		(a, b) => a.id - b.id
	// 	);
	//
	// 	const pricesMerged = prices.reduce((prev, curr) => {
	// 		return {
	// 			...prev,
	// 			[`${curr.name}`]: curr.price,
	// 		};
	// 	}, {});
	//
	// 	productFeed.push({
	// 		active,
	// 		id,
	// 		activeVariant,
	// 		variantId,
	// 		sku,
	// 		ean,
	// 		...pricesMerged,
	// 	});
	// });

	// const csv = new ObjectsToCsv(productFeed);
	// await csv.toDisk(`../generate/feed/ceny-kategorie.csv`, {
	// 	delimiter: ',',
	// });
	// const csvkategorie = new ObjectsToCsv(categoriesData);
	// await csvkategorie.toDisk(`../generate/feed/ceny-kategorie-spis.csv`, {
	// 	delimiter: ',',
	// });
	// console.log(`ceny-kategorie.csv zapisany.`);
};

generateCandeluxCsv();
