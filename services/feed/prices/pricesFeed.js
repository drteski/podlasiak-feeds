import { aliasesFilter, excludedFilter, saveFeedFileToDisk } from '../../processFeed.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';

const pricesCatalogFeed = async (data, languages, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, id, activeVariant, variantId, sku, ean, producer, title, sellPrice } = product;
			if (variantId === '') return;

			const names = languages.map((lang) => {
				if (lang === 'et') return { name: title[lang], lang: 'ee' };
				if (lang === 'bn') return { name: title[lang], lang: 'be' };
				if (lang === 'os') return { name: title[lang], lang: 'at' };
				if (lang === 'ga') return { name: title[lang], lang: 'ie' };
				if (lang === 'sl') return { name: title[lang], lang: 'si' };
				if (lang === 'el') return { name: title[lang], lang: 'gr' };
				if (lang === 'uk') return { name: title[lang], lang: 'ua' };
				return {
					lang,
					name: title[lang],
				};
			});
			const prices = languages.map((lang) => {
				if (lang === 'et')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'ee',
					};
				if (lang === 'bn')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'be',
					};
				if (lang === 'os')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'at',
					};
				if (lang === 'ga')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'ie',
					};
				if (lang === 'sl')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'si',
					};
				if (lang === 'el')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'gr',
					};
				if (lang === 'uk')
					return {
						currency: sellPrice[lang].currency,
						price: parseFloat(sellPrice[lang].price),
						lang: 'ua',
					};
				return {
					lang,
					currency: sellPrice[lang].currency,
					price: parseFloat(sellPrice[lang].price),
				};
			});

			return {
				uid: parseInt(`${id}${variantId}`),
				id: parseInt(id),
				active,
				variantId: parseInt(variantId),
				activeVariant,
				aliases,
				sku,
				ean,
				brand: producer,
				names,
				prices,
			};
		})
		.filter(Boolean);
	return { products, language: 'all' };
};

export const generatePricesCatalogFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		await pricesCatalogFeed(products, config.languages, config).then(async (data) => {
			await saveFeedFileToDisk(data, 'prices', 'json', '../generate/feed/');
		});
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
