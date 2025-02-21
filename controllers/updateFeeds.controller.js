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
import { generateSubiektFeed } from '../services/feed/subiekt/subiektFeed.js';
import { generateCatalogPatrycjaFeed } from '../services/feed/catalog-patrycja/catalogPatrycjaFeed.js';
import { generateCeneoFeed } from '../services/feed/ceneo/ceneoFeed.js';
import { generateJeftinieFeed } from '../services/feed/jeftinie/jeftinieFeed.js';
import { generateBianoFeed } from '../services/feed/biano/bianoFeed.js';
import { generateFyndiqFeed } from '../services/feed/fyndq/fyndqFeed.js';
import { generatePricesCatalogFeed } from '../services/feed/prices/pricesFeed.js';
import { generateGoogleFeed } from '../services/feed/google/googleFeed.js';
import { generateBaselinkerFeed } from '../services/feed/baselinker/baselinkerFeed.js';

const feedGenerators = [
	{ generator: generateGoogleFeed, config: feedsConfig.google },
	{ generator: generateBaselinkerFeed, config: feedsConfig.baselinker },
	{ generator: generatePricesCatalogFeed, config: feedsConfig.prices },
	{ generator: generateCeneoFeed, config: feedsConfig.ceneo },
	{ generator: generateRozetkaFeed, config: feedsConfig.rozetka },
	{ generator: generateBazzarFeed, config: feedsConfig.bazzar },
	{ generator: generatePepitaFeed, config: feedsConfig.pepita },
	{ generator: generateMatrixifyFeed, config: feedsConfig.matrixify },
	{ generator: generateMdfFeed, config: feedsConfig.mdf },
	{ generator: generateAtomstoreFeed, config: feedsConfig.atomstore },
	{ generator: generateGalaxusFeed, config: feedsConfig.galaxus },
	{ generator: generateSkroutzFeed, config: feedsConfig.skroutz },
	// {
	// 	generator: generateToolightCatalogFeed,
	// 	config: feedsConfig.toolightCatalog,
	// },
	{
		generator: generateCatalogPatrycjaFeed,
		config: feedsConfig.catalogPatrycja,
	},
	{ generator: generateFyndiqFeed, config: feedsConfig.fyndiq },
	{ generator: generateBianoFeed, config: feedsConfig.biano },
	{ generator: generateJeftinieFeed, config: feedsConfig.jeftinie },
	{ generator: generateWszystkoFeed, config: feedsConfig.wszystko },
];
export const generateFeeds = async (bar) => {
	return new Promise(async (resolve, reject) => {
		const products = await getProducts()
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
		bar.start(0, 1, {
			dane: 'Przesyłanie danych z Subiekta',
			additionalData: ``,
		});
		await generateSubiektFeed();
		bar.update(1, {
			dane: 'Przesłano dane z Subiekta',
			additionalData: ``,
		});
		resolve();
	});
};
