import dotenv from 'dotenv';
import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	productsChunker,
	saveFeedFileToDisk,
} from '../../processFeed.js';

dotenv.config({ path: '../.env' });

const matrixifyFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
		chunks = 0,
	}
) => {
	const totalProducts = aliasesFilter(data, aliases);

	const products = productsChunker(totalProducts, chunks).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const {
				active,
				activeVariant,
				variantId,
				title,
				description,
				sku,
				stock,
				weight,
				ean,
				producer,
				attributes,
				variantName,
				category,
				images,
				sellPrice,
			} = product;

			if (activeProducts) {
				if (!active) return;
			}

			if (activeVariants) {
				if (!activeVariant) return;
			}

			const storeUrl = getStoreUrl(language, 'Rea');

			const titleWithVariantName =
				title[language] +
				' ' +
				variantName[language]
					.replace('Drzwi:', '')
					.replace('Tür: ', '')
					.replace('Duschwand: ', '')
					.replace('Wand:', 'x')
					.replace('0 Tür: ', '0 x ')
					.replace(' Ścianka: ', 'x')
					.replace(' Drzwi: ', 'x')
					.replace(' x Ścianka:', 'x')
					.replace('Drzwi', '')
					.replace(':x', 'x')
					.replace('x1', ' x 1')
					.replace('---', '');

			const dynamicStock = () => {
				if (!active) return 0;
				if (stock < minStock) return 0;
				return stock;
			};

			const type = () => {
				if (category[language].length === 0) return '';
				if (
					category[language][category[language].length - 1].length ===
					undefined
				) {
					return category[language][category[language].length - 1]
						.name;
				} else {
					if (
						category[language][category[language].length - 1]
							.length === 0
					)
						return '';
					return category[language][category[language].length - 1]
						.map((cat) => cat.name)
						.join(' > ');
				}
			};

			if (type() === '') return;

			if (dynamicStock() === 0) return;

			chunk.push({
				Handle: variantId,
				Command: 'NEW',
				Vendor: producer,
				Title: titleWithVariantName,
				Type: type()
					.replace('Kategorie REA > ', '')
					.replace('Kategorie Tutumi > ', ''),
				Tags: '',
				Published: 'TRUE',
				'Option1 Name': 'Title',
				'Option1 Value': '',
				'Variant SKU': sku,
				'Variant Grams': parseFloat(weight) * 1000,
				'Variant Inventory Tracker': 'shopify',
				'Variant Inventory Qty': dynamicStock(),
				'Variant Inventory Policy': 'deny',
				'Variant Fulfillment Service': 'manual',
				'Variant Price':
					addMuToPrice(sellPrice[language].price, mu) * 0.95,
				'Variant Compare At Price': addMuToPrice(
					sellPrice[language].price,
					mu
				),
				'Variant Requires Shipping': 'TRUE',
				'Variant Taxable': 'TRUE',
				'Variant Barcode': ean,
				'Variant Weight Unit': 'kg',
				'Image Src': storeUrl + 'picture/fit-in/2000x2000/' + images[0],
				'Image Command': 'MERGE',
				'Image Position': 1,
				'Image Alt Text': titleWithVariantName + ' 1',
				'SEO Title': '',
				'SEO Description': '',
				'Metafield: custom.product_details [single_line_text_field]':
					attributes[language].length === undefined
						? `<ul>${[attributes[language]]
								.map(
									(attribute) =>
										`<li><strong>${attribute.name}:</strong>$;{attribute.value;}</li>`
								)
								.join('')}</ul>`
						: `<ul>${attributes[language]
								.map(
									(attribute) =>
										`<li><strong>${attribute.name}:</strong>$;{attribute.value;}</li>`
								)
								.join('')}</ul>`,
				'Metafield: custom.second_image [single_line_text_field]':
					images[1] === undefined
						? ''
						: `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${storeUrl}picture/fit-in/2000x2000/${images[1]}' alt=''>`,
				'Metafield: custom.third_image [single_line_text_field]':
					images[2] === undefined
						? ''
						: `<img style='height: 360px; width: auto; object-fit: contain; object-position: center;' src='${storeUrl}picture/fit-in/2000x2000/${images[2]} ' alt=''>`,
			});
			images.forEach((image, index) => {
				if (index === 0) return;
				chunk.push({
					Handle: variantId,
					Command: '',
					Vendor: '',
					Title: '',
					Type: '',
					Tags: '',
					Published: '',
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
					'Image Src': storeUrl + 'picture/fit-in/2000x2000/' + image,
					'Image Command': 'MERGE',
					'Image Position': index + 1,
					'Image Alt Text': titleWithVariantName + ' ' + (index + 1),
					'SEO Title': '',
					'SEO Description': '',
					'Metafield: custom.product_details [single_line_text_field]':
						'',
					'Metafield: custom.second_image [single_line_text_field]':
						'',
					'Metafield: custom.third_image [single_line_text_field]':
						'',
				});
			});
		});
		return chunk;
	});

	return { products, language };
};
const matrixifyFeedStockUpdate = async (
	data,
	language,
	{ mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], minStock, chunks = 0 }
) => {
	const totalProducts = aliasesFilter(data, aliases);

	const products = productsChunker(totalProducts, chunks).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const { variantId, stock, sellPrice } = product;

			chunk.push({
				Handle: variantId,
				Command: 'UPDATE',
				Published: stock < minStock ? 'FALSE' : 'TRUE',
				'Published Scope': stock < minStock ? 'global' : 'web',
				'Variant Inventory Qty': stock < minStock ? 0 : stock,
				'Variant Price':
					addMuToPrice(sellPrice[language].price, mu) * 0.95,
				'Variant Compare At Price': addMuToPrice(
					sellPrice[language].price,
					mu
				),
			});
		});
		return chunk;
	});

	return { products, language };
};

export const generateMatrixifyFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await matrixifyFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'matrixify',
						'csv',
						'../generate/feed/',
						',',
						true
					);
				}
			);
			await matrixifyFeedStockUpdate(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'matrixify_update',
						'csv',
						'../generate/feed/',
						',',
						true
					);
				}
			);
		}
		resolve();
	});
};
