import { newConfig } from '../config/config.js';
import { getDefaultAlias } from './descriptions.js';

const getStoreUrl = (lang, alias) => {
	const store = newConfig.filter((config) => config.code === lang);
	if (store[0].urls.filter((url) => url.alias === alias)[0] === undefined)
		return store[0].urls.filter((url) => url.alias === 'Rea')[0].url;
	return store[0].urls.filter((url) => url.alias === alias)[0].url;
};

export const imagesUrl = (data, language, producer, options = '') => {
	const defaults = {
		fitType: 'fit-in',
		width: 2000,
		height: 2000,
		filters: {
			quality: 100,
			fill: '#ffffff',
		},
	};

	const photoOptions =
		options === ''
			? ''
			: options === 'default'
				? `${defaults.fitType}/${defaults.width}x${defaults.height}/filters:quality(${defaults.filters.quality}):fill(${defaults.filters.fill},1)/`
				: `${options.fitType}/${options.width}x${options.height}/filters:quality(${options.filters.quality}):fill(${options.filters.fill.replace('#', '')},1)/`;

	const storeUrl = getStoreUrl(language, getDefaultAlias(producer));
	return data.map((img) => `${storeUrl}picture/${photoOptions}${img}`);
};

export const productUrl = (data, language, producer, options = '') => {
	const storeUrl = getStoreUrl(language, getDefaultAlias(producer));
	return storeUrl + data[language][getDefaultAlias(producer)] + options;
};
