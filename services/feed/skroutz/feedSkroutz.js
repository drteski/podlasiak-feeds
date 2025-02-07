import {
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	titleWithVariantName,
	xmlBuilider,
} from '../../processFeed.js';
import { skroutzCategories } from '../../../data/skroutzCategories.js';
import timestamp from 'time-stamp';
import {
	connectToGoogleSheets,
	getDataFromSheets,
} from '../../../utilities/googleSheets.js';
import { format } from 'date-fns';

const skroutzFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
	}
) => {
	const skroutzCategoriesSheets = await connectToGoogleSheets(
		'14Sr22z5Aic9yn75mC9AI6Rcnoy7Raxsptv6qkQQeyzc'
	)
		.then((document) =>
			getDataFromSheets(document, 'KATEGORIE').then((data) =>
				data.map((item) => ({
					...item,
					id: parseInt(item.id),
					variantId: parseInt(item.variantId),
				}))
			)
		)
		.catch((error) => 'error');
	if (skroutzCategoriesSheets === 'error') return;

	const mappedProducts = aliasesFilter(data, aliases)
		.map((product) => {
			const {
				active,
				id,
				variantId,
				activeVariant,
				sku,
				producer,
				title,
				variantName,
				category,
			} = product;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (sku === '') return;
			if (variantId === '') return;
			const skroutzProduct = skroutzCategoriesSheets.filter(
				(skroutz) =>
					skroutz.id === parseInt(id) &&
					skroutz.variantId === parseInt(variantId)
			);

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
				title: title[language] + ' ' + variantName[language],
				category:
					category[language][0] === undefined
						? ''
						: category[language][0].length === undefined
							? [category[language][0]]
									.map((cat) => cat.name)
									.join(' > ')
							: category[language][0]
									.map((cat) => cat.name)
									.join(' > '),
			};
		})
		.filter(Boolean)
		.sort((a, b) => {
			if (a.nowe === 'TAK') return 1;
			if (a.nowe === '') return -1;
		});

	await connectToGoogleSheets(
		'14Sr22z5Aic9yn75mC9AI6Rcnoy7Raxsptv6qkQQeyzc'
	).then(async (document) => {
		const sheet = await document.sheetsByTitle['KATEGORIE'];
		await sheet.setHeaderRow([
			'nowe',
			'id',
			'variantId',
			'producer',
			'title',
			'category',
			format(Date.now(), 'dd-MM-yyyy HH:mm:ss'),
		]);
		await sheet.clearRows();
		await sheet.addRows(mappedProducts);
	});

	const products = aliasesFilter(data, aliases)
		.map((product) => {
			const {
				active,
				variantId,
				activeVariant,
				sku,
				ean,
				weight,
				stock,
				producer,
				title,
				description,
				variantName,
				sellPrice,
				images,
				url,
			} = product;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (sku === '') return;
			if (variantId === '') return;

			const newTitle = titleWithVariantName(
				title[language],
				variantName[language]
			);
			if (newTitle.toLowerCase().includes('allegro')) return;
			if (newTitle.toLowerCase().includes('do usuniecia')) return;
			if (newTitle.toLowerCase().includes('do usunięcia')) return;
			if (newTitle.toLowerCase().includes('usuwamy')) return;

			const currentCategory = skroutzCategories.filter(
				(category) =>
					parseInt(category.variantId) === parseInt(variantId)
			);

			if (currentCategory.length === 0) return;

			const storeUrl = getStoreUrl(language, 'Rea');

			const media = images.map((img) => storeUrl + 'picture/' + img);

			return {
				id: variantId,
				name: newTitle,
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
				description: description[language]
					.replace('&oacute;', 'ó')
					.replace('żar&oacute;wki', '*'),
				quantity: stock < minStock ? 0 : stock,
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
	const rootElement = root
		.create({ version: '1.0', encoding: 'UTF-8' })
		.ele('rea')
		.ele('created_at')
		.txt(timestamp('DD-MM-YYYY HH:mm'))
		.up()
		.ele('products');

	products.forEach((product) => {
		const itemFront = rootElement
			.ele('product')
			.ele('id')
			.txt(`${product.id}`)
			.up()
			.ele('name')
			.dat(`${product.name}`)
			.up()
			.ele('link')
			.dat(`${product.link}`)
			.up();
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
				async (data) =>
					await xmlBuilider(data, skroutzXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'skroutz',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
