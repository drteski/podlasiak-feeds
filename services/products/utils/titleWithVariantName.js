export const titleWithVariantName = (title, variantName) => {
	const preparedTitle = title
		.split(' ')
		.filter((word) => word !== '')
		.map((word) => {
			if (word === 'XL' || word === 'XXL' || word === 'XS') return word;
			if (word.match(/app\d{1,}-\d{1,2}[a-z]{0,3}/gim)) return word.toUpperCase();
			return word[0].toUpperCase() + word.slice(1, word.length).toLowerCase();
		})
		.join(' ');

	const variantMatch = variantName.match(/\d+/gm);
	let newVariantName = '';
	if (variantMatch !== null) {
		if (variantMatch.length < 2) {
			if (variantMatch[0][0] !== '0') {
				if (variantMatch[0].length !== 4) {
					if (parseInt(variantMatch[0]) < 50) {
						if (variantName.match(/\([\d]+\)/gm)) {
							newVariantName = variantName.replace(/\s\([\d]+\)/gm, '').replace(/\([\d]+\)/gm, '');
						}
						if (!isNaN(parseInt(variantName.replace(' "N"', '').replace(' "n"', '')))) {
							newVariantName = '';
						} else {
							newVariantName = variantName;
						}
					} else {
						newVariantName = variantMatch[0];
					}
				} else {
					newVariantName = variantName;
				}
			} else {
				newVariantName = variantName;
			}
		} else {
			if (variantMatch.length >= 3) {
				if (variantMatch.length === 3) {
					if (variantName.match(/\d{1,}x\d{1,}x\d{1,}/gm)) {
						newVariantName = variantName;
					}
					if (parseInt(variantMatch[0]) < 10) newVariantName = variantName;
					if (variantName.match(/\d{1,}\s*-\s*\d{1,}/gm)) newVariantName = variantName;
					newVariantName = variantMatch.join('x');
				} else {
					if (variantName.match(/\d{1,}\s*-\s*\d{1,}/gm)) newVariantName = variantName;
					newVariantName = variantName;
				}
			} else {
				if (variantMatch[0][0] === '0') newVariantName = variantName;
				if (parseInt(variantMatch[0]) < 10) newVariantName = variantName;
				newVariantName = variantMatch.join('x');
			}
		}
	} else {
		if (variantName !== '')
			newVariantName = variantName
				.replace(' / ', '/')
				.replace('/', ' / ')
				.replace(',', '')
				.split(' ')
				.filter((word) => word !== '')
				.map((word) => {
					if (word === 'XL' || word === 'XXL' || word === 'XS') return word;
					return word[0].toUpperCase() + word.slice(1, word.length).toLowerCase();
				})
				.join(' ');
		newVariantName = variantName;
	}

	return `${preparedTitle} ${newVariantName}`;
};
