import prisma from '../../../../db.js';

export const pushProductCategories = async (data) => {
	return await Promise.all(
		data.map(async (product) => {
			const { id, variantId, categories } = product;
			return await Promise.all(
				categories.map(async (category) => {
					const existingCategories = await prisma.categories.findMany(
						{
							where: {
								productUid: parseInt(`${id}${variantId}`),
							},
							include: {
								category: true,
							},
						}
					);

					const arrEvery = (a1, a2) =>
						a1
							.sort((a, b) => a - b)
							.every((v, i) => {
								return v === a2[i];
							});
					const isThisIt = existingCategories
						.map((cat) => {
							const isSame = arrEvery(
								category,
								cat.category
									.map((cat) => cat.id)
									.sort((a, b) => a - b)
							);
							if (isSame) {
								return cat;
							}
						})
						.filter(Boolean);
					if (isThisIt.length > 0) {
						return await Promise.all(
							isThisIt
								.map(async (current) =>
									category.map(async (cat) =>
										prisma.categories.update({
											where: {
												id: current.id,
											},
											data: {
												category: {
													connect: {
														id: cat,
													},
												},
											},
										})
									)
								)
								.flat()
						);
					} else {
						const newCategories = await prisma.categories.create({
							data: {
								productUid: parseInt(`${id}${variantId}`),
								Product: {
									connect: {
										uid: parseInt(`${id}${variantId}`),
									},
								},
							},
						});
						return await Promise.all(
							category.map(async (cat) =>
								prisma.categories.update({
									where: {
										id: newCategories.id,
									},
									data: {
										category: {
											connect: {
												id: cat,
											},
										},
									},
								})
							)
						);
					}
				})
			);
		})
	);
};
