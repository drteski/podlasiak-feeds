import prisma from '../../../db.js';

export const pushCategories = async (categories) => {
	return await Promise.all(
		categories.map(async (category) => {
			await prisma.Category.upsert({
				where: {
					id: category.id,
				},
				update: {
					parentId: isNaN(category.parentId) ? 1 : category.parentId,
				},
				create: {
					id: category.id,
					parentId: isNaN(category.parentId) ? 1 : category.parentId,
				},
			});
			await Promise.all(
				category.name.map(async (cat) => {
					const existingName = await prisma.CategoryName.findFirst({
						where: {
							categoryId: category.id,
							lang: cat.lang,
							name: cat.name,
						},
					});
					if (existingName) {
						return await prisma.CategoryName.update({
							where: {
								id: existingName.id,
							},
							data: {
								categoryId: category.id,
								lang: cat.lang,
								name: cat.name,
								category: {
									connect: {
										id: category.id,
									},
								},
							},
						});
					} else {
						return await prisma.CategoryName.create({
							data: {
								categoryId: category.id,
								lang: cat.lang,
								name: cat.name,
								category: {
									connect: {
										id: category.id,
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
