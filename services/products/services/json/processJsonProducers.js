import fs from 'fs';

export const processJsonProducers = (filePath) => {
	const data = fs.readFileSync(filePath, 'utf8');
	return [
		{ id: 0, name: '' },
		...JSON.parse(data).producer.map((producer) => {
			return {
				id: parseInt(producer.$id),
				name: producer.$name,
			};
		}),
	];
};
