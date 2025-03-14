import { replaceEntities } from '../services/processFeed.js';

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
		case 'Rea':
			return 'Rea';
		case 'Nowodvorski':
			return 'Toolight';
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
			Rea:
				data[language]['Rea'] === undefined
					? ''
					: replaceEntities(data[language]['Rea']),
			Tutumi:
				data[language]['Tutumi'] === undefined
					? ''
					: replaceEntities(data[language]['Tutumi']),
			Toolight:
				data[language]['Toolight'] === undefined
					? ''
					: replaceEntities(data[language]['Toolight']),
		};
	} else {
		if (
			data[language][`${getDefaultAlias(producer)}`] === undefined ||
			data[language][`${getDefaultAlias(producer)}`] === ''
		) {
			return '';
		} else {
			// console.log(
			// 	replaceEntities(data[language][`${getDefaultAlias(producer)}`])
			// );
			return replaceEntities(
				data[language][`${getDefaultAlias(producer)}`]
			);
		}
	}
};
