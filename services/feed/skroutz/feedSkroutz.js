import { prepareProducts, saveFeedFileToDisk, titleWithVariantName, xmlBuilider } from '../../processFeed.js';
import { skroutzCategories } from '../../../data/skroutzCategories.js';
import timestamp from 'time-stamp';
import { connectToGoogleSheets, getDataFromSheets } from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';
import { imagesUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';

const skroutzFeed = async (data, language, options) => {
	const skroutzCategoriesSheets = await connectToGoogleSheets('14Sr22z5Aic9yn75mC9AI6Rcnoy7Raxsptv6qkQQeyzc')
		.then((document) =>
			getDataFromSheets(document, 'KATEGORIE').then((data) =>
				data.map((item) => ({
					...item,
					id: parseInt(item.id, 10),
					variantId: parseInt(item.variantId, 10),
				}))
			)
		)
		.catch(() => 'error');
	if (skroutzCategoriesSheets === 'error') return;

	const mappedProducts = prepareProducts(data, options)
		.map((product) => {
			const { id, variantId, producer, title, variantName, category } = product;

			const skroutzProduct = skroutzCategoriesSheets.filter((skroutz) => skroutz.id === parseInt(id, 10) && skroutz.variantId === parseInt(variantId, 10));

			if (skroutzProduct.length !== 0)
				return {
					nowe: skroutzProduct[0].nowe,
					id: skroutzProduct[0].id,
					variantId: skroutzProduct[0].variantId,
					producer,
					title: skroutzProduct[0].title,
					category: skroutzProduct[0].category,
				};
			return {
				nowe: 'TAK',
				id,
				variantId,
				producer,
				title: titleWithVariantName(title[language], variantName[language]),
				category:
					category[language][0] === undefined
						? ''
						: category[language][0].length === undefined
							? [category[language][0]].map((cat) => cat.name).join(' > ')
							: category[language][0].map((cat) => cat.name).join(' > '),
			};
		})
		.filter(Boolean)
		.sort((a, b) => {
			if (a.nowe === 'TAK') return 1;
			if (a.nowe === '') return -1;
		});

	await connectToGoogleSheets('14Sr22z5Aic9yn75mC9AI6Rcnoy7Raxsptv6qkQQeyzc').then(async (document) => {
		const sheet = await document.sheetsByTitle['KATEGORIE'];
		await sheet.setHeaderRow(['nowe', 'id', 'variantId', 'producer', 'title', 'category', format(Date.now(), 'dd-MM-yyyy HH:mm:ss')]);
		await sheet.clearRows();
		await sheet.addRows(mappedProducts);
	});

	const products = prepareProducts(data, options)
		.map((product) => {
			const { variantId, sku, ean, weight, stock, producer, title, description, variantName, sellPrice, images, url } = product;

			const currentCategory = skroutzCategories.filter((category) => parseInt(category.variantId, 10) === parseInt(variantId, 10));

			if (currentCategory.length === 0) return;

			const media = imagesUrl(images, language, producer);

			return {
				id: variantId,
				name: titleWithVariantName(title[language], variantName[language]),
				link: url,
				image: media[0],
				additionalimage: media,
				category: currentCategory[0].category,
				price_with_vat: sellPrice[language].price,
				vat: 24,
				manufacturer: producer,
				mpn: !sku ? '' : sku,
				ean: !ean ? '' : ean,
				availability: 'Παράδοση 1 έως 3 ημέρες',
				weight: weight * 1000,
				description: getDescription(description, language, producer),
				quantity: stock,
			};
		})
		.filter(Boolean);

	return {
		products,
		language,
	};
};
const skroutzXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root.create({ version: '1.0', encoding: 'UTF-8' }).ele('rea').ele('created_at').txt(timestamp('DD-MM-YYYY HH:mm')).up().ele('products');

	products.forEach((product) => {
		const itemFront = rootElement.ele('product').ele('id').txt(`${product.id}`).up().ele('name').dat(`${product.name}`).up().ele('link').dat(`${product.link}`).up();
		product.additionalimage.forEach((img, index) => {
			if (index === 0) return itemFront.ele('image').dat(`${img}`).up();
			return itemFront.ele('additionalimage').dat(`${img}`).up();
		});

		itemFront
			.ele('category')
			.dat(`${product.category}`)
			.up()
			.ele('price_with_vat')
			.txt(`${product.price_with_vat}`)
			.up()
			.ele('vat')
			.txt(`${product.vat}`)
			.up()
			.ele('manufacturer')
			.dat(`${product.manufacturer}`)
			.up()
			.ele('mpn')
			.txt(`${product.mpn}`)
			.up()
			.ele('ean')
			.txt(`${product.ean}`)
			.up()
			.ele('availability')
			.txt(`${product.availability}`)
			.up()
			.ele('weight')
			.txt(`${product.weight}`)
			.up()
			.ele('description')
			.txt(`${product.description}`)
			.up()
			.ele('quantity')
			.txt(`${product.quantity}`)
			.up()
			.up();
	});

	return rootElement;
};

export const generateSkroutzFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await skroutzFeed(products, language, config).then(
				async (data) => await xmlBuilider(data, skroutzXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'skroutz', 'xml', '../generate/feed/'))
			);
		}
		resolve();
	});
};
