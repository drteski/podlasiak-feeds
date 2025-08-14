import dotenv from 'dotenv';
import { aliasesFilter, excludedFilter, saveFeedFileToDisk, xmlBuilider } from '../../processFeed.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';
import { getDescription } from '../../../utilities/descriptions.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';
import { replaceEntities } from '../../products/utils/replaceEntities.js';
import { checkProductsInFeed, productsInFeed } from '../../products/utils/productsInFeed.js';
import { titleWithVariantName } from '../../products/utils/titleWithVariantName.js';
import { format } from 'date-fns';

dotenv.config({ path: '../.env' });

const shopflixFeed = async (data, language, { name, mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = await Promise.all(
		excludedFilter(aliasesFilter(data, aliases), options).map(async (product) => {
			const { active, activeVariant, variantId, title, description, sku, stock, producer, ean, images, variantName, sellPrice, weight, url } = product;
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

			const imgs = imagesUrl(images, language, aliases);
			if (imgs.length < 1) return;

			return {
				variantId,
				sku,
				name: titleWithVariantName(title[language], variantName[language]),
				ean,
				manufacturer: producer,
				description: replaceEntities(getDescription(description, language, producer)),
				weight,
				color: '',
				url: productUrl(url, language, aliases),
				image: imgs[0],
				additional_image: imgs[1],
				price: addMuToPrice(sellPrice[language].price, mu),
				list_price: addMuToPrice(sellPrice[language].price, mu),
				quantity: stock,
				shipping_lead_time: 0,
			};
		})
	);

	const finalProducts = products.filter(Boolean);
	await productsInFeed(name, finalProducts, language);

	return { products: finalProducts, language };
};

const shopflixXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('MPITEMS')
		.ele('created_at')
		.txt(format(new Date(), 'dd-MM-yyyy HH:mm:ss'))
		.up()
		.ele('products');

	products.forEach((product, index) => {
		rootElement
			.ele('product', { cnt: index + 1 })
			.ele('sku')
			.txt(product.sku)
			.up()
			.ele('name')
			.txt(product.name)
			.up()
			.ele('manufacturer')
			.txt(product.manufacturer)
			.up()
			.ele('description')
			.dat(product.description)
			.up()
			.ele('weight')
			.txt(product.weight)
			.up()
			.ele('color')
			.txt(product.color)
			.up()
			.ele('url')
			.dat(product.url)
			.up()
			.ele('image')
			.dat(product.image)
			.up()
			.ele('additional_image')
			.dat(product.additional_image)
			.up()
			.ele('price')
			.txt(product.price)
			.up()
			.ele('list_price')
			.txt(product.list_price)
			.up()
			.ele('quantity')
			.txt(product.quantity)
			.up()
			.ele('shipping_lead_time')
			.txt(product.shipping_lead_time)
			.up();
	});

	return rootElement;
};
export const generateShopflixFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await shopflixFeed(products, language, config).then(async (data) => {
				await xmlBuilider(data, shopflixXmlSchema).then(async (xml) => await saveFeedFileToDisk(xml, 'shopflix', 'xml', '../generate/feed/'));
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
