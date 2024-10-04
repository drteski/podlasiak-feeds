import prisma from '../../../../db.js';

export const pushProductBasePrices = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, price } = product;
			return await Promise.all(
				price.map(async (basePrice) => {
					const existingBasePrice = await prisma.basePrice.findFirst({
						where: {
							productUid: parseInt(`${id}${variantId}`),
							lang: basePrice.lang,
						},
					});
					if (existingBasePrice) {
						return prisma.basePrice.update({
							where: {
								id: existingBasePrice.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: basePrice.lang,
								price: parseFloat(basePrice.price),
								tax: basePrice.tax,
								currency: basePrice.currency,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.basePrice.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: basePrice.lang,
								price: parseFloat(basePrice.price),
								tax: basePrice.tax,
								currency: basePrice.currency,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					}
				})
			);
		})
	);
};
