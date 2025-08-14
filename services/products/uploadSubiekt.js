import dotenv from 'dotenv';
import Subiekt from '../../models/Subiekt.js';
import { isToday } from 'date-fns';

dotenv.config({ path: '../.env' });

export const uploadSubiekt = async (bar) => {
	return new Promise((resolve) => {
		(async () => {
			const existing = await Subiekt.findOne({});

			if (isToday(existing?.updatedAt)) return resolve();

			const { processSubiektData } = await import('./controllers/processSubiektData.js');
			const { pushSubiekt } = await import('./services/pushSubiekt.js');

			const subiektProducts = await processSubiektData();

			bar.start(subiektProducts.length, 0, {
				dane: 'Zapisywanie danych Subiekta do bazy',
				additionalData: ` 0/${subiektProducts.length} •`,
			});
			for await (const [index, product] of subiektProducts.entries()) {
				bar.update(index + 1, {
					dane: 'Zapisywanie danych Subiekta do bazy',
					additionalData: ` ${index + 1}/${subiektProducts.length} •`,
				});
				await pushSubiekt(product);
			}
			bar.start(0, 0, {
				dane: 'Zapisano dane Subiekta do bazy',
				additionalData: '',
			});
			resolve();
		})();
	});
};
