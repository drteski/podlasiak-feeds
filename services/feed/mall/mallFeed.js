import dotenv from 'dotenv';
import { aliasesFilter, excludedFilter, saveFeedFileToDisk, xmlBuilider } from '../../processFeed.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { descriptionSplitter, getDescription } from '../../../utilities/descriptions.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';
import { replaceEntities } from '../../products/utils/replaceEntities.js';
import { connectToGoogleSheets, getDataFromSheets } from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';
import { checkProductsInFeed, productsInFeed } from '../../products/utils/productsInFeed.js';

dotenv.config({ path: '../.env' });

const mallFeed = async (data, language, { name, mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const mallCategories = await connectToGoogleSheets('1ith5IRM1EJnIJ3MwkPw87DwLANIELoX1uS1w4Yik6GA').then((document) => getDataFromSheets(document, language.toUpperCase()).then((data) => data));
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { active, activeVariant, variantId, title, description, sku, stock, producer, ean, attributes, images, sellPrice, weight } = product;
			const isInFeed = await checkProductsInFeed(name, variantId, language);
			if (!isInFeed) {
				if (variantId === '') return;
				if (sku === '') return;
				if (ean === '' || !ean) return;
				if (activeProducts) {
					if (!active) return;
				}
				if (activeVariants) {
					if (!activeVariant) return;
				}
				if (stock < minStock) return;
			}

			const desc = descriptionSplitter(replaceEntities(getDescription(description, language, producer)));
			const attrs =
				attributes[language].length === undefined
					? [attributes[language]].map((atr) => `<li><strong>${atr.name}:</strong> ${atr.value}</li>`).join('')
					: attributes[language].map((atr) => `<li><strong>${atr.name}:</strong> ${atr.value}</li>`).join('');
			const mallCategory = mallCategories.find((cat) => cat.variantId === variantId);

			return {
				variantId,
				id: variantId,
				stage: 'live',
				categoryId: mallCategory?.categoryId === undefined ? '' : mallCategory.categoryId,
				brandId: producer,
				alias: product.aliases.join('\n'),
				title: title[language],
				stock,
				shortdesc: desc[0],
				longdesc: `${desc[2]}${attrs}`,
				packageSize: 'smallbox',
				barcode: ean,
				sku,
				price: addMuToPrice(sellPrice[language].price, mu),
				vat: 25,
				media: imagesUrl(images, language, aliases).map((img, index) => ({
					url: img,
					main: index === 0,
				})),
				dimensions: [{ weight }],
				freeDelivery: false,
				deliveryDelay: 0,
				attrs,
			};
		})
	);

	const finalProducts = products.filter(Boolean);
	await productsInFeed(name, finalProducts, language);

	return { products: finalProducts, language };
};

const mallXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('ITEMS', {
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'version': '1',
		});

	products.forEach((product) => {
		if (product.categoryId === '') return;
		const offer = rootElement
			.ele('ITEM')
			.ele('ID')
			.txt(product.id)
			.up()
			.ele('STAGE')
			.txt(product.stage)
			.up()
			.ele('BRAND_ID')
			.txt(product.brandId)
			.up()
			.ele('CATEGORY_ID')
			.txt(product.categoryId)
			.up()
			.ele('PRIORITY')
			.txt('1')
			.up()
			.ele('TITLE')
			.dat(product.title)
			.up()
			.ele('SHORTDESC')
			.dat(product.shortdesc)
			.up()
			.ele('LONGDESC')
			.dat(product.longdesc)
			.up()
			.ele('PACKAGE_SIZE')
			.txt(product.packageSize)
			.up()
			.ele('BARCODE')
			.txt(product.barcode)
			.up()
			.ele('PRICE')
			.txt(product.price)
			.up()
			.ele('VAT')
			.txt(product.vat)
			.up();

		product.media.forEach((img) => {
			return offer.ele('MEDIA').ele('URL').txt(`${img.url}`).up().ele('MAIN').txt(`${img.main}`).up().up();
		});

		offer
			.ele('DIMENSIONS')
			.ele('WEIGHT')
			.txt(`${product.dimensions[0].weight}`)
			.up()
			.up()
			.ele('FREE_DELIVERY')
			.txt(`${product.freeDelivery}`)
			.up()
			.ele('DELIVERY_DELAY')
			.txt(`${product.deliveryDelay}`);
	});

	return rootElement;
};
const mallAvailableXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('AVAILABILITIES', {
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'version': '1',
		});

	products.forEach((product) => {
		if (product.categoryId === '') return;
		rootElement
			.ele('AVAILABILITY')
			.ele('ID')
			.txt(`${product.id}`)
			.up()
			.ele('IN_STOCK')
			.txt(`${product.stock}`)
			.up()
			.ele('ACTIVE')
			.txt(`${product.stock > 0 ? 'true' : 'false'}`)
			.up();
	});

	return rootElement;
};
const mallGoogleSheets = async (data, language) => {
	const sheetsData = data.map((product) => ({
		variantId: product.id,
		sku: product.sku,
		ean: product.barcode,
		producer: product.brandId,
		alias: product.alias,
		categoryId: product.categoryId,
		title: product.title,
		description: product.longdesc,
	}));
	await connectToGoogleSheets('1ith5IRM1EJnIJ3MwkPw87DwLANIELoX1uS1w4Yik6GA').then(async (document) => {
		const sheet = await document.sheetsByTitle[language.toUpperCase()];
		const headers = Object.keys(sheetsData[0]);
		await sheet.setHeaderRow([...headers, format(Date.now(), 'dd-MM-yyyy HH:mm:ss')]);
		await sheet.clearRows();
		await sheet.addRows(sheetsData);
	});
};
export const generateMallFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await mallFeed(products, language, config).then(async (data) => {
				await xmlBuilider(data, mallXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'mall', 'xml', '../generate/feed/'));
				await xmlBuilider(data, mallAvailableXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'mall_available', 'xml', '../generate/feed/'));
				await mallGoogleSheets(data.products, language);
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
