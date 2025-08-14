export const chunker = (array, chunkSize) => {
	const dataChunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		const chunks = array.slice(i, i + chunkSize);
		dataChunks.push(chunks);
	}
	return dataChunks;
};
