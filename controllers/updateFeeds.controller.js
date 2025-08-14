import { feedsConfig } from '../config/config.js';
import { generateBigBangFeed } from '../services/feed/bigbang/bigbangFeed.js';
import { generateMallFeed } from '../services/feed/mall/mallFeed.js';
import { generateShopflixFeed } from '../services/feed/shpflix/shopflixFeed.js';

const generators = async () => {
	const { generateRozetkaFeed } = await import('../services/feed/rozetka/rozetkaFeed.js');
	const { generatePepitaFeed } = await import('../services/feed/pepita/pepitaFeed.js');
	const { generateWszystkoFeed } = await import('../services/feed/wszystko/wszystkoFeed.js');
	const { generateMatrixifyFeed } = await import('../services/feed/matrixify/matrixifyFeed.js');
	const { generateMdfFeed } = await import('../services/feed/mdf/mdfFeed.js');
	const { generateAtomstoreFeed } = await import('../services/feed/atomstore/atomstoreFeed.js');
	const { generateBazzarFeed } = await import('../services/feed/bazzar/bazzarFeed.js');
	const { generateGalaxusFeed } = await import('../services/feed/galaxus/galaxusFeed.js');
	const { generateSkroutzFeed } = await import('../services/feed/skroutz/feedSkroutz.js');
	const { generateSubiektFeed, generateSubiektPricesFeed } = await import('../services/feed/subiekt/subiektFeed.js');
	const { generateCatalogPatrycjaFeed } = await import('../services/feed/catalog-patrycja/catalogPatrycjaFeed.js');
	const { generateCeneoFeed } = await import('../services/feed/ceneo/ceneoFeed.js');
	const { generateJeftinieFeed } = await import('../services/feed/jeftinie/jeftinieFeed.js');
	const { generateBianoFeed } = await import('../services/feed/biano/bianoFeed.js');
	const { generateFyndiqFeed } = await import('../services/feed/fyndq/fyndqFeed.js');
	const { generatePricesCatalogFeed } = await import('../services/feed/prices/pricesFeed.js');
	const { generateGoogleFeed } = await import('../services/feed/google/googleFeed.js');
	const { generateBaselinkerFeed } = await import('../services/feed/baselinker/baselinkerFeed.js');
	const { generateAllPricesFeed } = await import('../services/feed/allPrices/allPricesFeed.js');
	const { generateDomilampyPlFeed } = await import('../services/feed/shopify/domilampy_pl/domilampyPlFeed.js');
	const { generateFurdoszobaplusHuFeed } = await import('../services/feed/shopify/furdoszobaplus_hu/furdoszobaplusHuFeed.js');
	const { generateBaiehomeRoFeed } = await import('../services/feed/shopify/baiehome_ro/baiehomeRoFeed.js');
	const { generateDellahomeFrFeed } = await import('../services/feed/shopify/dellahome_fr/dellahomeFrFeed.js');
	const { generateDellahomePlFeed } = await import('../services/feed/shopify/dellahome_pl/dellahomePlFeed.js');
	const { generateBadezimmerperleDeFeed } = await import('../services/feed/shopify/badezimmerperle_de/badezimmerperleDeFeed.js');
	const { generateHeurekaFeed } = await import('../services/feed/heureka/heurekaFeed.js');
	const { generateDimensionsFeed } = await import('../services/feed/dimensions/dimensionsFeed.js');
	const { generateLoristoFeed } = await import('../services/feed/idosell/loristo/loristoFeed.js');
	const { generateBricoBravoFeed } = await import('../services/feed/brico-bravo/bricoBravoFeed.js');
	const { generateSkuImagesOnlyFeed } = await import('../services/feed/skuImagesOnly/skuImagesOnlyFeed.js');
	const { generateToolightB2BFeed } = await import('../services/feed/toolightB2B/toolightB2BFeed.js');
	return [
		{ generator: generateShopflixFeed, config: feedsConfig.shopflix },
		{ generator: generateMallFeed, config: feedsConfig.mall },
		{ generator: generateBigBangFeed, config: feedsConfig.bigbang },
		{ generator: generateSubiektFeed, config: { name: 'Subiekt produkty' } },
		{ generator: generateSubiektPricesFeed, config: { name: 'Subiekt ceny' } },
		{ generator: generateWszystkoFeed, config: feedsConfig.wszystko },
		{ generator: generateToolightB2BFeed, config: feedsConfig.toolightB2B },
		{ generator: generateBricoBravoFeed, config: feedsConfig.bricoBravo },
		{ generator: generateSkuImagesOnlyFeed, config: feedsConfig.skuImages },
		{ generator: generateCatalogPatrycjaFeed, config: feedsConfig.catalogPatrycja },
		{ generator: generatePepitaFeed, config: feedsConfig.pepita },
		{ generator: generateBazzarFeed, config: feedsConfig.bazzar },
		{ generator: generateSkroutzFeed, config: feedsConfig.skroutz },
		{ generator: generateAllPricesFeed, config: feedsConfig.allPrices },
		{ generator: generateLoristoFeed, config: feedsConfig.loristo },
		{ generator: generateDimensionsFeed, config: { name: 'Dimensions' } },
		{ generator: generateJeftinieFeed, config: feedsConfig.jeftinie },
		{ generator: generateGalaxusFeed, config: feedsConfig.galaxus },
		{ generator: generateHeurekaFeed, config: feedsConfig.heureka },
		{ generator: generateDomilampyPlFeed, config: feedsConfig.domilampy_pl },
		{ generator: generateFurdoszobaplusHuFeed, config: feedsConfig.furdoshobaplus_hu },
		{ generator: generateDellahomeFrFeed, config: feedsConfig.dellahome_fr },
		{ generator: generateDellahomePlFeed, config: feedsConfig.dellahome_pl },
		{ generator: generateBadezimmerperleDeFeed, config: feedsConfig.badezimmerperle_de },
		{ generator: generateBaiehomeRoFeed, config: feedsConfig.baiehome_ro },
		{ generator: generateRozetkaFeed, config: feedsConfig.rozetka },
		{ generator: generateGoogleFeed, config: feedsConfig.google },
		{ generator: generateBaselinkerFeed, config: feedsConfig.baselinker },
		{ generator: generatePricesCatalogFeed, config: feedsConfig.prices },
		{ generator: generateCeneoFeed, config: feedsConfig.ceneo },
		{ generator: generateMatrixifyFeed, config: feedsConfig.matrixify },
		{ generator: generateMdfFeed, config: feedsConfig.mdf },
		{ generator: generateAtomstoreFeed, config: feedsConfig.atomstore },
		{ generator: generateFyndiqFeed, config: feedsConfig.fyndiq },
		{ generator: generateBianoFeed, config: feedsConfig.biano },
	];
};

export const generateFeeds = async (bar) => {
	return new Promise((resolve, reject) => {
		(async () => {
			const { getProducts } = await import('../services/processFeed.js');
			const products = await getProducts()
				.then((data) => data)
				.catch((error) => reject(error));

			if (products.length === 0) return reject('Brak produktów');

			bar.start(0, 0, {
				dane: 'Generowanie feedów',
				additionalData: ` ${0}/${0} •`,
			});
			const feedGenerators = await generators();
			const progress = {
				bar,
				count: feedGenerators.length,
				accumulator: 1,
			};

			bar.start(progress.count, progress.accumulator, {
				dane: 'Generowanie feedów',
				additionalData: ` ${progress.accumulator}/${progress.count} •`,
			});

			for await (const feedGenerator of feedGenerators) {
				const { generator, config } = feedGenerator;
				setTimeout(() => {}, 1000);
				bar.update(progress.accumulator, {
					dane: 'Generowanie ' + config.name,
					additionalData: ` ${progress.accumulator}/${progress.count} •`,
				});
				setTimeout(() => {}, 1000);
				await generator(products, config);
				bar.update(progress.accumulator, {
					dane: 'Zapisano ' + config.name,
					additionalData: ` ${progress.accumulator}/${progress.count} •`,
				});
				setTimeout(() => {}, 1000);
				progress.accumulator++;
			}

			resolve();
		})();
	});
};
