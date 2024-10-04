const getAttrs = (data) => {
	const attrsSet = [];
	const attributes = data.attrs[0].a;
	attributes.forEach((attrs, index) => {
		if (
			index === 0 ||
			index === 1 ||
			index === 2 ||
			index === attributes.length - 1
		)
			return;
		attrsSet.push({
			name: attrs.ATTR.name,
			value: attrs._,
		});
	});
	return attrsSet;
};

export default getAttrs;
