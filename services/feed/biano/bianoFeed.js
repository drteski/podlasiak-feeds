import { aliasesFilter, saveFeedFileToDisk, excludedFilter, xmlBuilider } from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { checkProductsInFeed, productsInFeed } from '../../products/utils/productsInFeed.js';

const bianoFeed = async (data, language, { name, mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { active, id, variantId, activeVariant, sku, stock, producer, title, description, sellPrice, images, url, attributes } = product;
			const isInFeed = await checkProductsInFeed(name, variantId, language);
			if (!isInFeed) {
				if (variantId === '') return;
				if (sku === '') return;
				if (activeProducts) {
					if (!active) return;
				}
				if (activeVariants) {
					if (!activeVariant) return;
				}
				if (stock < minStock) return;
			}

			const filteredAttributes = (attributes[language].length === undefined ? [attributes[language]] : attributes[language])
				.map((attribute) => {
					if (attribute.value === '' || attribute.value === undefined) return;
					if (attribute.value === 'Wysyłamy w: 24h') return;
					if (attribute.value === '*Wysyłamy w: 24h*') return;
					return attribute;
				})
				.filter(Boolean);

			let deliveryTime;
			switch (language) {
				case 'de':
					deliveryTime = 'Lieferung in 3-5 Tagen';
					break;
				case 'en':
					deliveryTime = 'Delivery in 3-5 days';
					break;
				case 'es':
					deliveryTime = 'Entrega en 3-5 días';
					break;
				case 'fr':
					deliveryTime = 'Livraison en 3-5 jours';
					break;
				case 'it':
					deliveryTime = 'Consegna in 3-5 giorni';
					break;
				case 'pl':
					deliveryTime = 'Dostawa 1-2 dni';
					break;
			}

			return {
				id,
				title: title[language],
				description: getDescription(description, language, producer),
				brand: producer,
				url: productUrl(url, language, aliases, '?utm_source=idealo&utm_medium=cpc'),
				media: imagesUrl(images, language, aliases),
				deliveryTime,
				attributes: filteredAttributes,
				price: sellPrice[language].price,
				variantId,
			};
		})
	);

	const finalProducts = products.filter(Boolean).reduce((acc, curr) => {
		if (acc.find((item) => item.id === curr.id)) return acc;
		return acc.concat(curr);
	}, []);
	await productsInFeed(name, finalProducts, language);
	return {
		products: finalProducts,
		language,
	};
};
const bianoXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root.create({
		version: '1.0',
		encoding: 'UTF-8',
	});

	const offers = rootElement.ele('ITEMS', {
		'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
		'version': '1',
	});

	products.forEach((product) => {
		const itemFront = offers
			.ele('ITEM')
			.ele('ITEM_ID')
			.txt(`${product.id}`)
			.up()
			.ele('PRODUCTNAME')
			.txt(`${product.title}`)
			.up()
			.ele('DESCRIPTION')
			.txt(`${product.description}`)
			.up()
			.ele('MANUFACTURER')
			.txt(`${product.brand}`)
			.up()
			.ele('URL')
			.txt(`${product.url}`)
			.up()
			.ele('IMGURL')
			.txt(`${product.media[0]}`)
			.up()
			.ele('IMGURL_ALTERNATIVE')
			.txt(`${product.media[1]}`)
			.up()
			.ele('IMGURL_ALTERNATIVE')
			.txt(`${product.media[1]}`)
			.up()
			.ele('DELIVERY_DATE')
			.txt(`0`)
			.up()
			.ele('SALE_PRICE')
			.txt(`${product.price}`)
			.up()
			.ele('DELIVERY')
			.ele('DELIVERY_ID')
			.txt('Corriere')
			.up()
			.ele('DELIVERY_PRICE')
			.txt('0')
			.up()
			.up();

		const itemAttributes = () => {
			return product.attributes.forEach((attr, index) => {
				if (index === 0) return;
				return offers.ele('PARAM').ele('PARAM_NAME').txt(`${attr.name}`).up().ele('VAL').txt(`${attr.value}`).up().up();
			});
		};
		itemAttributes();
	});
	return rootElement;
};

export const generateBianoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await bianoFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, bianoXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'biano', 'xml', '../generate/feed/'))
			);
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
