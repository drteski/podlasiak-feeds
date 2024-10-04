import fs from 'fs';

export const processJsonProfileFields = (filePath) => {
	const data = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(data).field.map((field) => {
		return {
			id: parseInt(field.$id),
			profileId: parseInt(field.$profile),
			type: field.$type,
			name: {
				...field.name.reduce((prev, curr) => {
					return {
						...prev,
						[`${curr.$lang}`]: curr.$,
					};
				}, {}),
			},
		};
	});
};
