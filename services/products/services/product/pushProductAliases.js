import prisma from '../../../../db.js';

export const pushProductAliases = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, aliases } = product;
			return await aliases.map(async (alias) => {
				const existingAlias = await prisma.alias.findFirst({
					where: { name: alias },
				});
				return prisma.product.update({
					where: {
						uid: parseInt(`${id}${variantId}`),
					},
					data: {
						aliases: {
							connect: { id: existingAlias.id },
						},
					},
				});
			});
		})
	);
};
