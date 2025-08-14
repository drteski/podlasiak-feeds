import { stripHtml } from 'string-strip-html';

export const getDefaultAlias = (producer) => {
	switch (producer) {
		case 'Tutumi':
			return 'Tutumi';
		case 'FlexiFit':
			return 'Tutumi';
		case 'Bluegarden':
			return 'Tutumi';
		case 'PuppyJoy':
			return 'Tutumi';
		case 'Kigu':
			return 'Tutumi';
		case 'Fluffy Glow':
			return 'Tutumi';
		case 'Toolight':
			return 'Toolight';
		case 'Spectrum LED':
			return 'Toolight';
		case 'Nowodvorski':
			return 'Toolight';
		case 'Rea':
			return 'Rea';
		case 'Quadron':
			return 'Rea';
		case 'Calani':
			return 'Rea';
		case 'Hadwao':
			return 'Rea';
		default:
			return 'Rea';
	}
};

export const getDescription = (data, language, producer, all = false) => {
	if (all) {
		return {
			Rea: data[language]['Rea'] === undefined ? '' : stripHtml(data[language]['Rea']).result,
			Tutumi: data[language]['Tutumi'] === undefined ? '' : stripHtml(data[language]['Tutumi']).result,
			Toolight: data[language]['Toolight'] === undefined ? '' : stripHtml(data[language]['Toolight']).result,
		};
	} else {
		if (data[language][`${getDefaultAlias(producer)}`] === undefined || data[language][`${getDefaultAlias(producer)}`] === '') {
			return '';
		} else {
			return stripHtml(data[language][`${getDefaultAlias(producer)}`]).result;
		}
	}
};

const findClosest = (arr, num) => {
	if (arr == null) {
		return;
	}

	let closest = arr[0];
	for (let item of arr) {
		if (Math.abs(item - num) < Math.abs(closest - num)) {
			closest = item;
		}
	}
	return closest;
};
export const descriptionSplitter = (description) => {
	if (description.length === 0) return ['', ''];
	if (description.length <= 200) return [description, ''];
	const dotIndexes = [];
	description.split('').forEach((des, index) => {
		if (des !== '.') return;
		dotIndexes.push(index);
	});
	const half = Math.floor(description.length / 2);
	const firstPart = description.slice(0, dotIndexes[dotIndexes.indexOf(findClosest(dotIndexes, half))] + 1);
	const secondPart = description.slice(dotIndexes[dotIndexes.indexOf(findClosest(dotIndexes, half))] + 1, -1);
	return [firstPart, secondPart, description];
};
