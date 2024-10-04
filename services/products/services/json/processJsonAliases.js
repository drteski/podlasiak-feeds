import fs from 'fs';

export const processJsonAliases = (filePath) => {
	const data = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(data)
		.alias.map((alias) => ({
			id: parseInt(alias.$id),
			name:
				alias.$name[0].toUpperCase() +
				alias.$name.slice(1, alias.$name.length),
		}))
		.filter(
			(alias) =>
				alias.name === 'Rea' ||
				alias.name === 'Tutumi' ||
				alias.name === 'Toolight'
		);
};
