import prisma from '../../../../db.js';

export const pushProductStockAndPrices = async (data) => {
	return await Promise.all(
		data
			.map(async (product) => {
				const { id, variantId, stock } = product;
				const existingProduct = await prisma.product.findFirst({
					where: {
						uid: parseInt(`${id}${variantId}`),
					},
				});
				if (existingProduct) {
					return prisma.product.update({
						where: {
							uid: parseInt(`${id}${variantId}`),
						},
						data: {
							stock,
						},
					});
				}
			})
			.filter(Boolean)
	);
};
