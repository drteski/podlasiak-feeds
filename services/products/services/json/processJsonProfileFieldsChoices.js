import fs from 'fs';

export const processJsonProfileFieldsChoices = (filePath) => {
	const data = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(data).choice.map((choice) => {
		if (choice.name === undefined)
			return {
				id: parseInt(choice.$id),
				fieldId: parseInt(choice.$field),
				ordering: choice.$ordering,
				name: [],
			};
		return {
			id: parseInt(choice.$id),
			fieldId: parseInt(choice.$field),
			ordering: choice.$ordering,
			name: {
				...choice.name.reduce((prev, curr) => {
					return {
						...prev,
						[`${curr.$lang}`]: curr.$,
					};
				}, {}),
			},
		};
	});
};
