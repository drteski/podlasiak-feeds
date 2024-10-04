import prisma from '../../../db.js';

export const pushAliases = async (aliases) => {
	return await Promise.all(
		aliases.map(async (alias) => {
			await prisma.alias.upsert({
				where: alias,
				create: alias,
				update: alias,
			});
		})
	);
};
