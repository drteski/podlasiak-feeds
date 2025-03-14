import { newConfig } from '../config/config.js';

const getStoreUrl = (lang, alias) => {
	const store = newConfig.filter((config) => config.code === lang);
	return store[0].urls.filter((url) => url.alias === alias)[0].url;
};

export const imagesUrl = (data, language, aliases, options = '') => {
	const defaults = {
		fitType: 'fit-in',
		width: 2000,
		height: 2000,
		filters: {
			quality: 100,
			fill: 'transparent',
		},
	};

	const photoOptions =
		options === ''
			? ''
			: options === 'default'
				? `${defaults.fitType}/${defaults.width}x${defaults.height}/filters:quality(${defaults.filters.quality}):fill(${defaults.filters.fill},1)/`
				: `${options.fitType}/${options.width}x${options.height}/filters:quality(${options.filters.quality}):fill(${options.filters.fill.replace('#', '')},1)/`;

	const alias = aliases.length === 0 ? 'Rea' : aliases[0];
	const storeUrl = getStoreUrl(language, alias);
	return data.map((img) => `${storeUrl}picture/${photoOptions}${img}`);
};

export const productUrl = (data, language, aliases, options = '') => {
	const alias = aliases.length === 0 ? 'Rea' : aliases[0];
	const storeUrl = getStoreUrl(language, alias);
	return storeUrl + data[language][alias] + options;
};
