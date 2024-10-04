import prisma from '../../../../db.js';

export const pushProductAttributes = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, attributes } = product;
			return attributes
				.map(async (attribute) => {
					const existingAttribute =
						await prisma.productProfileFields.findMany({
							where: {
								productUid: parseInt(`${id}${variantId}`),
							},
						});
					const existingIndex = existingAttribute.findIndex(
						(existing) =>
							JSON.stringify(existing.value) ===
							JSON.stringify(attribute.value)
					);
					if (existingIndex === -1) {
						return prisma.productProfileFields.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								fieldId: attribute.id,
								type: attribute.type,
								value: attribute.value,
								product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.productProfileFields.update({
							where: {
								id: existingAttribute[existingIndex].id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								fieldId: attribute.id,
								type: attribute.type,
								value: attribute.value,
								product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					}
				})
				.flat();
		})
	);
};
