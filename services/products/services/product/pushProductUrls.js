import prisma from '../../../../db.js';

export const pushProductUrls = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, url } = product;
			return await Promise.all(
				url.map(async (u) => {
					const existingUrls = await prisma.urls.findFirst({
						where: {
							productUid: parseInt(`${id}${variantId}`),
							lang: u.lang,
							alias: {
								some: {
									name: u.alias,
								},
							},
						},
					});
					const existingAlias = await prisma.alias.findFirst({
						where: { name: u.alias },
					});
					if (existingUrls) {
						return prisma.urls.update({
							where: {
								id: existingUrls.id,
							},
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: u.lang,
								url: u.url,
								alias: {
									connect: {
										id: existingAlias.id,
									},
								},
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
					} else {
						return prisma.urls.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								lang: u.lang,
								url: u.url,
								alias: {
									connect: {
										id: existingAlias.id,
									},
								},
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
