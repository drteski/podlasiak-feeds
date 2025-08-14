import dotenv from 'dotenv';
import { aliasesFilter, productsChunker, productsFilter, saveFeedFileToDisk, shopifyCategoryTypes, titleWithVariantName } from '../../../processFeed.js';
import { imagesUrl } from '../../../../utilities/urls.js';
import { runFeedGenerator } from '../../../products/services/runFeedGenerator.js';
import { addMuToPrice } from '../../../products/utils/addMuToPrice.js';

dotenv.config({ path: '../../.env' });

const domilampyPlFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, chunks = 0 }) => {
	const products = productsChunker(
		productsFilter(aliasesFilter(data, aliases), {
			activeProducts,
			activeVariants,
			minStock,
			emptySku: true,
			emptyVariant: true,
		}),
		chunks
	).map((products) => {
		const chunk = [];
		products.forEach((product) => {
			const { variantId, title, sku, stock, weight, ean, producer, attributes, variantName, category, images, sellPrice } = product;

			const shopifyType = shopifyCategoryTypes(category[language]);

			if (shopifyType === '') return;

			const titleVariant = titleWithVariantName(title[language], variantName[language])
				.split(' ')
				.filter((item) => item !== '')
				.map((item) => item[0].toUpperCase() + item.slice(1, item.length))
				.join(' ');

			const media = imagesUrl(images, language, aliases);

			chunk.push({
				'Handle': variantId,
				'Command': 'NEW',
				'Status': 'Active',
				'Vendor': producer,
				'Title': titleVariant,
				'Type': shopifyType.replace('Kategorie REA > ', '').replace('Kategorie Tutumi > ', ''),
				'Tags': '',
				'Option1 Name': 'Title',
				'Option1 Value': '',
				'Variant SKU': sku,
				'Variant Grams': parseFloat(weight) * 1000,
				'Variant Inventory Tracker': 'shopify',
				'Variant Inventory Qty': stock,
				'Variant Inventory Policy': 'deny',
				'Variant Fulfillment Service': 'manual',
				'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Requires Shipping': 'TRUE',
				'Variant Taxable': 'TRUE',
				'Variant Barcode': ean,
				'Variant Weight Unit': 'kg',
				'Image Src': media[0],
				'Image Command': 'MERGE',
				'Image Position': 1,
				'Image Alt Text': `${titleVariant} 1`,
				'SEO Title': '',
				'SEO Description': '',
				'Metafield: custom.product_details [single_line_text_field]':
					attributes[language].length === undefined
						? `<ul style="list-style: none; ${language === 'ro' ? '' : 'margin: 0 -10px'}; padding: 0;">${[attributes[language]]
								.map((attribute) => {
									if (attribute.name === 'zusätzliche Beschreibung' || attribute.name === 'Informații de livrare') return;
									return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`
						: `<ul style="list-style: none; ${language === 'ro' ? '' : 'margin: 0 -10px'}; padding: 0;">${attributes[language]
								.map((attribute) => {
									if (attribute.name === 'zusätzliche Beschreibung' || attribute.name === 'Informații de livrare') return;
									return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`,
				'Metafield: custom.second_image [single_line_text_field]':
					media[1] === undefined ? '' : `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${media[1]}" alt="">`,
				'Metafield: custom.third_image [single_line_text_field]':
					media[2] === undefined ? '' : `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${media[2]} " alt="">`,
			});
			media.forEach((image, index) => {
				if (index === 0) return;
				chunk.push({
					'Handle': variantId,
					'Command': '',
					'Status': '',
					'Vendor': '',
					'Title': '',
					'Type': '',
					'Tags': '',
					'Option1 Name': '',
					'Option1 Value': '',
					'Variant SKU': '',
					'Variant Grams': '',
					'Variant Inventory Tracker': '',
					'Variant Inventory Qty': '',
					'Variant Inventory Policy': '',
					'Variant Fulfillment Service': '',
					'Variant Price': '',
					'Variant Compare At Price': '',
					'Variant Requires Shipping': '',
					'Variant Taxable': '',
					'Variant Barcode': '',
					'Variant Weight Unit': '',
					'Image Src': image,
					'Image Command': 'MERGE',
					'Image Position': index + 1,
					'Image Alt Text': `${titleVariant} ${index + 1}`,
					'SEO Title': '',
					'SEO Description': '',
					'Metafield: custom.product_details [single_line_text_field]': '',
					'Metafield: custom.second_image [single_line_text_field]': '',
					'Metafield: custom.third_image [single_line_text_field]': '',
				});
			});
		});
		return chunk;
	});
	return { products, language };
};
const domilampyPlFeedStockUpdate = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], minStock, chunks = 0 }) => {
	const products = productsChunker(
		productsFilter(aliasesFilter(data, aliases), {
			activeProducts: false,
			activeVariants: false,
			minStock,
			emptySku: true,
			emptyVariant: true,
		}),
		chunks
	).map((products) => {
		const chunk = [];
		products.forEach((product) => {
			const { sku, stock, sellPrice } = product;
			chunk.push({
				'Variant SKU': sku,
				'Command': 'UPDATE',
				'Status': 'Active',
				'Published': 'TRUE',
				'Published Scope': 'global',
				'Variant Inventory Qty': stock,
				'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
			});
		});
		return chunk;
	});

	return { products, language };
};

export const generateDomilampyPlFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await domilampyPlFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'domilampy', 'csv', '../generate/feed/', ',', true);
			});
			await domilampyPlFeedStockUpdate(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'domilampy_update', 'csv', '../generate/feed/', ',', true);
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
