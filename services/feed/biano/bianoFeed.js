import { saveFeedFileToDisk, xmlBuilider, replaceEntities, prepareProducts } from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const bianoFeed = async (data, language, options) => {
	const products = prepareProducts(data, options)
		.map((product) => {
			const { variantId, producer, title, description, sellPrice, images, url, attributes } = product;

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
				variantId,
				title: title[language],
				description: replaceEntities(getDescription(description, language, producer)),
				brand: producer,
				url: productUrl(url, language, producer, '?utm_source=idealo&utm_medium=cpc'),
				media: imagesUrl(images, language, producer),
				deliveryTime,
				attributes: filteredAttributes,
				price: sellPrice[language].price,
			};
		})
		.filter(Boolean);

	return {
		products,
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
		version: '1',
	});

	products.forEach((product) => {
		offers
			.ele('ITEM')
			.ele('ITEM_ID')
			.txt(`${product.variantId}`)
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
		for await (const language of config.languages) {
			await bianoFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, bianoXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'biano', 'xml', '../generate/feed/'))
			);
		}
		resolve();
	});
};
