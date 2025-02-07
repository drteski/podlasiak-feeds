export const getFinalCategory = (
	categoryObject,
	path = true,
	separator = ' > '
) => {
	if (path) {
		return categoryObject[0] === undefined
			? ''
			: categoryObject[0].length === undefined
				? [categoryObject[0]].map((cat) => cat.name).join(separator)
				: categoryObject[0].map((cat) => cat.name).join(separator);
	}
	const lastCategory =
		categoryObject[0] === undefined
			? ''
			: categoryObject[categoryObject.length - 1].length !== undefined
				? categoryObject[categoryObject.length - 1].map(
						(cat) => cat.name
					)
				: categoryObject[categoryObject.length - 1];
	return lastCategory[lastCategory.length - 1];
};
