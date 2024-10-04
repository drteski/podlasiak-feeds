import fs from 'fs';

export const processJsonProfiles = (filePath) => {
	const data = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(data).profile.map((profile) => {
		return {
			id: parseInt(profile.$id),
			name: {
				...profile.name.reduce((prev, curr) => {
					return {
						...prev,
						[`${curr.$lang}`]: curr.$,
					};
				}, {}),
			},
		};
	});
};
