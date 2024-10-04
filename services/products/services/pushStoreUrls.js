import prisma from '../../../db.js';

export const pushStoreUrls = async (config) => {
	return await Promise.all(
		config.map(async (conf) =>
			conf.urls.map(async (url) => {
				const existingStoreUrl = await prisma.StoreUrl.findFirst({
					where: {
						url: url.url,
						lang: conf.code,
						alias: {
							is: {
								name: url.alias,
							},
						},
					},
				});
				if (existingStoreUrl) {
					return await prisma.StoreUrl.update({
						where: {
							id: existingStoreUrl.id,
						},
						data: {
							alias: {
								connect: {
									name: url.alias,
								},
							},
							lang: conf.code,
							url: url.url,
						},
					});
				} else {
					return await prisma.StoreUrl.create({
						data: {
							alias: {
								connect: {
									name: url.alias,
								},
							},
							lang: conf.code,
							url: url.url,
						},
					});
				}
			})
		)
	);
};
