import prisma from '../../../db.js';

export const pushProfiles = async (profileFields, profileChoices) => {
	await Promise.all(
		profileFields.map(async (field) => {
			return prisma.profiles.upsert({
				where: {
					id: field.id,
				},
				create: {
					id: field.id,
					type: field.type,
				},
				update: {
					id: field.id,
					type: field.type,
				},
			});
		})
	);

	for await (const field of profileFields) {
		await Promise.all(
			field.name.map(async (name) => {
				const existingName = await prisma.profilesName.findFirst({
					where: {
						profileId: field.id,
						lang: name.lang,
					},
				});
				if (existingName) {
					return prisma.profilesName.update({
						where: { id: existingName.id },
						data: {
							lang: name.lang,
							name: name.value,
							profileId: field.id,
							profile: {
								connect: {
									id: field.id,
								},
							},
						},
					});
				} else {
					return prisma.profilesName.create({
						data: {
							lang: name.lang,
							name: name.value,
							profileId: field.id,
							profile: {
								connect: {
									id: field.id,
								},
							},
						},
					});
				}
			})
		);
	}

	await Promise.all(
		profileChoices.map(async (field) => {
			return prisma.profileChoices.upsert({
				where: {
					id: field.id,
				},
				create: {
					id: field.id,
					fieldId: field.fieldId,
				},
				update: {
					id: field.id,
					fieldId: field.fieldId,
				},
			});
		})
	);

	for await (const field of profileChoices) {
		await Promise.all(
			field.name.map(async (name) => {
				const existingChoice =
					await prisma.profileChoicesName.findFirst({
						where: {
							choiceId: field.id,
							lang: name.lang,
						},
					});
				if (existingChoice) {
					return prisma.profileChoicesName.update({
						where: { id: existingChoice.id },
						data: {
							lang: name.lang,
							name: name.value,
							choiceId: field.id,
							profileChoices: {
								connect: {
									id: field.id,
								},
							},
						},
					});
				} else {
					return prisma.profileChoicesName.create({
						data: {
							lang: name.lang,
							name: name.value,
							choiceId: field.id,
							profileChoices: {
								connect: {
									id: field.id,
								},
							},
						},
					});
				}
			})
		);
	}
};
