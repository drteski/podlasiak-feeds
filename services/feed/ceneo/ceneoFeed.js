import {
	aliasesFilter,
	excludedFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	xmlBuilider,
} from '../../processFeed.js';
import { getFinalCategory } from '../../../utilities/category.js';
import { imagesUrl, productUrl } from '../../../utilities/urls.js';

const ceneoFeed = async (
	data,
	language,
	{
		mu = 0,
		aliases = ['Rea', 'Tutumi', 'Toolight'],
		activeProducts = true,
		activeVariants = true,
		minStock,
		options,
	}
) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const {
				active,
				variantName,
				activeVariant,
				variantId,
				title,
				description,
				sku,
				stock,
				ean,
				producer,
				weight,
				category,
				attributes,
				images,
				sellPrice,
				url,
			} = product;
			if (producer === '') return;

			if (variantId === '') return;

			if (activeVariants) {
				if (!activeVariant) return;
			}

			const attributeArray =
				attributes[language].length === undefined
					? [attributes[language]]
					: attributes[language];

			const specification = attributeArray.filter((attribute) => {
				if (
					attribute.name !== 'Wariant opcji' ||
					attribute.name !== 'Informacja o dostawie'
				)
					return attribute;
			});

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

			return {
				variantId,
				title: titleWithVariantName,
				stock,
				weight,
				description: description[language],
				specification: [
					{ name: 'Producent', value: producer },
					{ name: 'EAN', value: ean },
					{ name: 'Kod producenta', value: sku },
					...specification,
				],
				url: productUrl(url, language, aliases),
				price: sellPrice[language].price,
				images: imagesUrl(images, language, aliases),
				category: getFinalCategory(category[language], true),
			};
		})
		.filter(Boolean);
	return {
		products,
		language,
	};
};
const ceneoXmlSchema = (data, root) => {
	const products = data;
	const rootElement = root
		.create({
			version: '1.0',
			encoding: 'UTF-8',
		})
		.ele('offers', {
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			version: '1',
			name: 'other',
		})
		.ele('responsibleProducers')
		.ele('p', { id: 'Rea' })
		.ele('name')
		.txt('Podlasiak Andrzej Cylwik Spółka Komandytowa')
		.up()
		.ele('address')
		.ele('countryCode')
		.txt('PL')
		.up()
		.ele('street')
		.txt('Przędzalniana 60')
		.up()
		.ele('postalCode')
		.txt('15-688')
		.up()
		.ele('city')
		.txt('Białystok')
		.up()
		.up()
		.ele('contact')
		.ele('email')
		.txt('biuro.rea@podlasiak.com.pl')
		.up()
		.up()
		.up()
		.up();
	products.forEach((product) => {
		const start = rootElement
			.ele('o', {
				id: product.variantId,
				url: product.url,
				price: product.price,
				avail: product.stock > 0 ? '1' : '99',
				weight: product.weight,
				stock: product.stock,
				basket: product.stock > 0 ? '1' : '0',
				set: 0,
			})
			.ele('cat')
			.txt(`${product.category}`)
			.up()
			.ele('name')
			.txt(`${product.title}`)
			.up()
			.ele('desc')
			.dat(`${product.description}`)
			.up()
			.ele('images');

		const images = () => {
			return product.images.forEach((img, index) =>
				index === 0
					? start.ele('main', { url: img }).up()
					: start.ele('i', { url: img }).up()
			);
		};

		images();
		const end = start
			.up()
			.ele('attrs')
			.ele('a', { name: 'Producent odpowiedzialny' })
			.dat('Podlasiak Andrzej Cylwik Spółka Komandytowa')
			.up();
		const attributes = () => {
			return product.specification.forEach((attribute) => {
				if (attribute.value === undefined || attribute.value === '')
					return;
				return end
					.ele('a', { name: attribute.name })
					.dat(attribute.value)
					.up()
					.up();
			});
		};
		attributes();
	});
	return rootElement;
};

export const generateCeneoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await ceneoFeed(products, language, config).then(
				async (data) =>
					await xmlBuilider(data, ceneoXmlSchema).then(
						async (xml) =>
							await saveFeedFileToDisk(
								xml,
								'ceneo',
								'xml',
								'../generate/feed/'
							)
					)
			);
		}
		resolve();
	});
};
