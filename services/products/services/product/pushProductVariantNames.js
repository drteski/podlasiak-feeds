import prisma from '../../../../db.js';

export const pushProductVariantNames = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, variantName } = product;
			return await Promise.all(
				variantName.map(async (varName) => {
					const existingVariantName =
						await prisma.variantName.findFirst({
							where: {
								productUid: parseInt(`${id}${variantId}`),
								lang: varName.lang,
							},
						});
					if (existingVariantName) {
						return prisma.variantName.update({
							where: {
								id: existingVariantName.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: varName.lang,
								name: varName.text,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.variantName.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: varName.lang,
								name: varName.text,
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
