import { processJsonAliases } from '../services/json/processJsonAliases.js';
import { processJsonProducers } from '../services/json/processJsonProducers.js';
import { processJsonCategories } from '../services/json/processJsonCategories.js';
import { processJsonProfiles } from '../services/json/processJsonProfiles.js';
import { processJsonProfileFields } from '../services/json/processJsonProfileFields.js';
import { processJsonProfileFieldsChoices } from '../services/json/processJsonProfileFieldsChoices.js';
import { processJsonProducts } from '../services/json/processJsonProducts.js';

export const aliases = processJsonAliases('../public/temp/data/aliases.json');
export const producers = processJsonProducers(
	'../public/temp/data/producers.json'
);
export const categories = processJsonCategories(
	'../public/temp/data/categories.json'
);
export const profiles = processJsonProfiles(
	'../public/temp/data/profiles.json'
);
export const profileFields = processJsonProfileFields(
	'../public/temp/data/profile_fields.json'
);
export const profileFieldsChoices = processJsonProfileFieldsChoices(
	'../public/temp/data/profile_fields_choices.json'
);

export const processProducts = (fileName, index) => {
	const data = {
		aliases,
		categories,
		profiles,
		profileFields,
		profileFieldsChoices,
		producers,
	};
	return processJsonProducts(fileName, data, index);
};
