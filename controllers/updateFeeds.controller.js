import { feedsConfig } from '../config/config.js';
import dotenv from 'dotenv';

import { getProducts } from '../services/processFeed.js';
import { generateRozetkaFeed } from '../services/feed/rozetka/rozetkaFeed.js';
import fs from 'fs';
import { generatePepitaFeed } from '../services/feed/pepita/pepitaFeed.js';
import { generateWszystkoFeed } from '../services/feed/wszystko/wszystkoFeed.js';
import { generateMatrixifyFeed } from '../services/feed/matrixify/matrixifyFeed.js';
import { generateMdfFeed } from '../services/feed/mdf/mdfFeed.js';
import { generateAtomstoreFeed } from '../services/feed/atomstore/atomstoreFeed.js';
//
// dotenv.config({ path: '../.env' });
//

const feedGenerators = [
	{ generator: generateRozetkaFeed, config: feedsConfig.rozetka },
	{ generator: generatePepitaFeed, config: feedsConfig.pepita },
	{ generator: generateMatrixifyFeed, config: feedsConfig.matrixify },
	{ generator: generateMdfFeed, config: feedsConfig.mdf },
	{ generator: generateAtomstoreFeed, config: feedsConfig.atomstore },
	{ generator: generateWszystkoFeed, config: feedsConfig.wszystko },
];
export const generateFeeds = async (bar) => {
	return new Promise(async (resolve, reject) => {
		const products = await getProducts().then((data) => data);

		if (products.length === 0) return reject();

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

		resolve();
	});
};
