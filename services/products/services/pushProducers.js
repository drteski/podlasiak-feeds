import prisma from '../../../db.js';

export const pushProducers = async (producers) => {
	return await Promise.all(
		producers.map(async (producer) => {
			await prisma.producer.upsert({
				where: producer,
				create: producer,
				update: producer,
			});
		})
	);
};
