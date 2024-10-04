import prisma from '../../../../db.js';

export const pushProductSellPrices = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, promoPrice } = product;
			return await Promise.all(
				promoPrice.map(async (sellPrice) => {
					const existingSellPrice = await prisma.sellPrice.findFirst({
						where: {
							productUid: parseInt(`${id}${variantId}`),
							lang: sellPrice.lang,
						},
					});
					if (existingSellPrice) {
						return prisma.sellPrice.update({
							where: {
								id: existingSellPrice.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: sellPrice.lang,
								price: parseFloat(sellPrice.price),
								tax: sellPrice.tax,
								currency: sellPrice.currency,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.sellPrice.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: sellPrice.lang,
								price: parseFloat(sellPrice.price),
								tax: sellPrice.tax,
								currency: sellPrice.currency,
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
