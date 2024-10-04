import fs from 'fs';

export const processJsonCategories = (filePath) => {
	const data = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(data).category.map((category) => {
		return {
			id: parseInt(category.$id),
			parentId: parseInt(category.$parent),
			name: category.name.reduce((prev, curr) => {
				return {
					...prev,

					[`${curr.$lang}`]: curr.$ === undefined ? '' : curr.$,
				};
			}, {}),
		};
	});
};
