import prisma from '../../../../db.js';

export const pushProductDescriptions = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, description } = product;
			return await Promise.all(
				description.map(async (desc) => {
					const existingDescription =
						await prisma.description.findFirst({
							where: {
								productUid: parseInt(`${id}${variantId}`),
								lang: desc.lang,
							},
						});
					if (existingDescription) {
						return prisma.description.update({
							where: {
								id: existingDescription.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: desc.lang,
								name: desc.text,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.description.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: desc.lang,
								name: desc.text,
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
