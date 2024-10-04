import prisma from '../../../../db.js';

export const pushProductImages = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, images } = product;
			return await Promise.all(
				images.map(async (image, index) => {
					const existingImage = await prisma.image.findFirst({
						where: {
							productUid: parseInt(`${id}${variantId}`),
						},
					});
					if (existingImage) {
						return prisma.image.update({
							where: {
								id: existingImage.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								main: index === 0,
								format: 'jpeg',
								height: 'auto',
								width: 'auto',
								url: image,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.image.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								main: index === 0,
								format: 'jpeg',
								height: 'auto',
								width: 'auto',
								url: image,
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
