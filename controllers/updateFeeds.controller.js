import { feedsConfig } from '../config/config.js';

import { getProducts } from '../services/processFeed.js';
import { generateRozetkaFeed } from '../services/feed/rozetka/rozetkaFeed.js';
import { generatePepitaFeed } from '../services/feed/pepita/pepitaFeed.js';
import { generateWszystkoFeed } from '../services/feed/wszystko/wszystkoFeed.js';
import { generateMatrixifyFeed } from '../services/feed/matrixify/matrixifyFeed.js';
import { generateMdfFeed } from '../services/feed/mdf/mdfFeed.js';
import { generateAtomstoreFeed } from '../services/feed/atomstore/atomstoreFeed.js';
import { generateToolightCatalogFeed } from '../services/feed/toolight-catalog/toolightCatalogFeed.js';
import { generateBazzarFeed } from '../services/feed/bazzar/bazzarFeed.js';
import { generateGalaxusFeed } from '../services/feed/galaxus/galaxusFeed.js';
import { generateSkroutzFeed } from '../services/feed/skroutz/feedSkroutz.js';
import { generateSubiektFeed, getSubiektProducts } from '../services/feed/subiekt/subiektFeed.js';
import { generateCatalogPatrycjaFeed } from '../services/feed/catalog-patrycja/catalogPatrycjaFeed.js';
import { generateCeneoFeed } from '../services/feed/ceneo/ceneoFeed.js';
import { generateJeftinieFeed } from '../services/feed/jeftinie/jeftinieFeed.js';
import { generateBianoFeed } from '../services/feed/biano/bianoFeed.js';
import { generateFyndiqFeed } from '../services/feed/fyndq/fyndqFeed.js';
import { generatePricesCatalogFeed } from '../services/feed/prices/pricesFeed.js';
import { generateGoogleFeed } from '../services/feed/google/googleFeed.js';
import { generateBaselinkerFeed } from '../services/feed/baselinker/baselinkerFeed.js';
import { generateAllPricesFeed } from '../services/feed/allPrices/allPricesFeed.js';
import { generateFruugoFeed } from '../services/feed/fruugo/fruugoFeed.js';
import { generateDomilampyPlFeed } from '../services/feed/shopify/domilampy_pl/domilampyPlFeed.js';
import { generateDellahomeFrFeed } from '../services/feed/shopify/dellahome_fr/dellahomeFrFeed.js';
import { generateDellahomePlFeed } from '../services/feed/shopify/dellahome_pl/dellahomePlFeed.js';
import { generateBaiehomeRoFeed } from '../services/feed/shopify/baiehome_ro/baiehomeRoFeed.js';
import { generateFurdoszobaplusHuFeed } from '../services/feed/shopify/furdoszobaplus_hu/furdoszobaplusHuFeed.js';
import { generateBadezimmerperleDeFeed } from '../services/feed/shopify/badezimmerperle_de/badezimmerperleDeFeed.js';
import { generateBasicFeed } from '../services/feed/basic/basicFeed.js';

const feedGenerators = [
	{ generator: generateDomilampyPlFeed, config: feedsConfig.domilampy_pl },
	{ generator: generateRozetkaFeed, config: feedsConfig.rozetka },
	{ generator: generatePepitaFeed, config: feedsConfig.pepita },
	{ generator: generateSkroutzFeed, config: feedsConfig.skroutz },
	{ generator: generateMatrixifyFeed, config: feedsConfig.matrixify },
	{ generator: generateDellahomeFrFeed, config: feedsConfig.dellahome_fr },
	{ generator: generateDellahomePlFeed, config: feedsConfig.dellahome_pl },
	{ generator: generateBaiehomeRoFeed, config: feedsConfig.baiehome_ro },
	{ generator: generateBadezimmerperleDeFeed, config: feedsConfig.badezimmerperle_de },
	{ generator: generateFurdoszobaplusHuFeed, config: feedsConfig.furdoshobaplus_hu },
	{ generator: generateMdfFeed, config: feedsConfig.mdf },
	{ generator: generateBazzarFeed, config: feedsConfig.bazzar },
	{ generator: generateGoogleFeed, config: feedsConfig.google },
	{ generator: generateBaselinkerFeed, config: feedsConfig.baselinker },
	{ generator: generateAllPricesFeed, config: feedsConfig.allPrices },
	{ generator: generateJeftinieFeed, config: feedsConfig.jeftinie },
	{ generator: generatePricesCatalogFeed, config: feedsConfig.prices },
	{ generator: generateCeneoFeed, config: feedsConfig.ceneo },
	{ generator: generateCatalogPatrycjaFeed, config: feedsConfig.catalogPatrycja },
	// { generator: generateFruugoFeed, config: feedsConfig.fruugo },
	{ generator: generateAtomstoreFeed, config: feedsConfig.atomstore },
	// { generator: generateBasicFeed, config: feedsConfig.basic },
	{ generator: generateBianoFeed, config: feedsConfig.biano },
	{ generator: generateFyndiqFeed, config: feedsConfig.fyndiq },
	{ generator: generateGalaxusFeed, config: feedsConfig.galaxus },
	// { generator: generateToolightCatalogFeed, config: feedsConfig.toolightCatalog },
	{ generator: generateWszystkoFeed, config: feedsConfig.wszystko },
];

const subiektProducts = await getSubiektProducts().then((data) => data);

export const generateFeeds = async (bar) => {
	return new Promise(async (resolve, reject) => {
		const products = await getProducts(subiektProducts)
			.then((data) => data)
			.catch((error) => reject(error));

		if (products.length === 0) return reject('Brak produktów');

		const progress = {
			bar,
			count: feedGenerators.length,
			accumulator: 0,
		};

		bar.start(progress.count, progress.accumulator, {
			dane: 'Generowanie feedów',
			additionalData: ` ${progress.accumulator}/${progress.count} •`,
		});
		setTimeout(() => {}, 1000);
		for await (const feedGenerator of feedGenerators) {
			const { generator, config } = feedGenerator;
			setTimeout(() => {}, 1000);
			bar.update(progress.accumulator, {
				dane: `Generowanie ${config.name}`,
				additionalData: ` ${progress.accumulator}/${progress.count} •`,
			});
			setTimeout(() => {}, 1000);
			await generator(products, config);
			bar.update(progress.accumulator, {
				dane: `Zapisano ${config.name}`,
				additionalData: ` ${progress.accumulator}/${progress.count} •`,
			});
			setTimeout(() => {}, 1000);
			// eslint-disable-next-line no-plusplus
			progress.accumulator++;
		}
		bar.start(0, 1, {
			dane: 'Przesyłanie danych z Subiekta',
			additionalData: ``,
		});
		await generateSubiektFeed(subiektProducts);
		bar.update(1, {
			dane: 'Przesłano dane z Subiekta',
			additionalData: ``,
		});
		resolve();
	});
};
