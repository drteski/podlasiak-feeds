import XmlStream from 'xml-stream';

import axios from 'axios';
import builder from 'xmlbuilder2';
import fs from 'fs';

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
const generateFeedCeny = async () => {
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

			const title = item.titles.$children
				.map((title) => {
					if (title.$.lang === 'pl') return title.$children[0];
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

			parsedProductData.push({
				id: item.$.id,
				aliases,
				active: item.$.active === 'true' ? 1 : 0,
				activeVariant: '',
				variantId: '',
				sku: '',
				ean: '',
				title: title.length === 0 ? '' : title[0],
				variantName: '',
				weight: item.$.weight,
				cenaPodstawowa: basePrices,
				cenaPromocyjna: sellPrices,
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
					title: title.length === 0 ? '' : title[0],
					variantName: variantName.length === 0 ? '' : variantName[0],
					cenaPodstawowa: variantBasePrices,
					cenaPromocyjna: variantSellPrices,
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
	feed.products.forEach((product) => {
		const {
			id,
			active,
			activeVariant,
			variantId,
			sku,
			ean,
			weight,
			title,
			variantName,
			cenaPodstawowa,
			cenaPromocyjna,
		} = product;
		const baseTaxonomy = feed.taxonomy.map((taxo) => {
			return {
				id: taxo.id,
				name: `${taxo.id}_${taxo.name}_${taxo.currency}`,
			};
		});
		const saleTaxonomy = feed.taxonomy.map((taxo) => {
			return {
				id: taxo.id,
				name: `${taxo.id}_${taxo.name.replace(
					'Podstawowa',
					'Promocyjna'
				)}_${taxo.currency}`,
			};
		});

		const cenaPodstawowaNowa = baseTaxonomy.map((base) => {
			const priceIndex = cenaPodstawowa.findIndex(
				(podstawowa) => base.id === podstawowa.id
			);
			if (priceIndex === -1)
				return { id: base.id, price: '', name: base.name };
			return {
				id: base.id,
				price: cenaPodstawowa[priceIndex].gross,
				name: base.name,
			};
		});

		const cenaPromocyjnaNowa = saleTaxonomy.map((base) => {
			const priceIndex = cenaPromocyjna.findIndex(
				(podstawowa) => base.id === podstawowa.id
			);
			if (priceIndex === -1)
				return { id: base.id, price: '', name: base.name };
			return {
				id: base.id,
				price: cenaPromocyjna[priceIndex].gross,
				name: base.name,
			};
		});
		const prices = [...cenaPodstawowaNowa, ...cenaPromocyjnaNowa].sort(
			(a, b) => a.id - b.id
		);

		const pricesMerged = prices.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.name}`]: curr.price,
			};
		}, {});

		productFeed.push({
			active,
			id,
			activeVariant,
			variantId,
			sku,
			ean,
			weight,
			title,
			variantName,
			basePrice: pricesMerged['1_Podstawowa PLN_PLN'],
			sellPrice: pricesMerged['1_Promocyjna PLN_PLN'],
		});
	});

	const root = builder
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('Products', {
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			version: '1',
		});
	productFeed.forEach((product) => {
		const itemFront = root
			.ele('Product')
			.ele('Active')
			.txt(product.active)
			.up()
			.ele('Id')
			.txt(product.id)
			.up()
			.ele('ActiveVariant')
			.txt(product.activeVariant)
			.up()
			.ele('VariantId')
			.txt(product.variantId)
			.up()
			.ele('Sku')
			.txt(product.sku)
			.up()
			.ele('Ean')
			.txt(product.ean)
			.up()
			.ele('Name')
			.txt(product.title)
			.up()
			.ele('VariantName')
			.txt(product.variantName === '---' ? '' : product.variantName)
			.up()
			.ele('BasePrice')
			.txt(product.basePrice)
			.up()
			.ele('SellPrice')
			.txt(product.sellPrice)
			.up();
	});

	const xmlToSave = root.end({
		format: 'xml',
		prettyPrint: true,
	});

	await fs.writeFile(
		`../generate/feed/feed-ceny-merce.xml`,
		xmlToSave,
		(error) => {
			if (error) console.log(error);
		}
	);

	console.log(`feed-ceny-merce.xml zapisany.`);
};

export default generateFeedCeny;

generateFeedCeny();
