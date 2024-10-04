import prisma from '../../../../db.js';

export const pushProductTitles = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, title } = product;
			return await Promise.all(
				title.map(async (titleName) => {
					const existingTitle = await prisma.title.findFirst({
						where: {
							productUid: parseInt(`${id}${variantId}`),
							lang: titleName.lang,
						},
					});
					if (existingTitle) {
						return prisma.title.update({
							where: {
								id: existingTitle.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: titleName.lang,
								name: titleName.text,
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.title.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: titleName.lang,
								name: titleName.text,
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
