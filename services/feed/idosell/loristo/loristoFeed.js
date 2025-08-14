import { aliasesFilter, saveFeedFileToDisk, excludedFilter, xmlBuilider } from '../../../processFeed.js';
import { imagesUrl } from '../../../../utilities/urls.js';
import { getDescription } from '../../../../utilities/descriptions.js';
import { runFeedGenerator } from '../../../products/services/runFeedGenerator.js';

const loristoFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, options }) => {
	let i = 0;
	const attrsWithId = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, variantId, activeVariant, sku, stock, attributes } = product;
			if (variantId === '') return;
			if (sku === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			return attributes[language].length === undefined ? [attributes[language]] : attributes[language];
		})
		.filter(Boolean)
		.flatMap((attribute) => attribute)
		.reduce((acc, curr) => {
			if (acc.findIndex((ac) => ac.name === curr.name) !== -1) return acc;
			if (curr.name === 'Gwarancja') return acc;
			if (curr.name === 'Informacja o dostawie') return acc;
			i++;
			return [...acc, { name: curr.name, id: 1000 + i }];
		}, []);

	const products = excludedFilter(aliasesFilter(data, aliases), options)
		.map((product) => {
			const { active, variantId, activeVariant, sku, ean, weight, stock, producer, title, description, sellPrice, images, attributes } = product;
			if (variantId === '') return;
			if (sku === '') return;
			if (activeProducts) {
				if (!active) return;
			}
			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (stock < minStock) return;

			const attributesCombined = (attributes[language].length === undefined ? [attributes[language]] : attributes[language]).reduce((acc, attribute, index) => {
				if (attribute.value === '' || attribute.value === undefined) return acc;
				if (attribute.value === 'Wysyłamy w: 24h') return acc;
				if (attribute.value === '*Wysyłamy w: 24h*') return acc;
				if (attribute.name === 'Gwarancja') return acc;
				const existingIndex = attrsWithId.findIndex((attr) => attr.name === attribute.name);
				if (existingIndex === -1) return acc;
				acc[`/parameters/parameter@id`] = acc[`/parameters/parameter@id`] === undefined ? [attrsWithId[existingIndex].id] : [...acc[`/parameters/parameter@id`], attrsWithId[existingIndex].id];
				acc[`/parameters/parameter@priority`] = acc[`/parameters/parameter@priority`] === undefined ? [index] : [...acc[`/parameters/parameter@priority`], index];
				acc[`/parameters/parameter@name[pol]`] = acc[`/parameters/parameter@name[pol]`] === undefined ? [attribute.name] : [...acc[`/parameters/parameter@name[pol]`], attribute.name];
				acc[`/parameters/parameter@type`] = acc[`/parameters/parameter@type`] === undefined ? ['parametr'] : [...acc[`/parameters/parameter@type`], 'parametr'];
				acc[`/parameters/parameter/value@parameter_id`] =
					acc[`/parameters/parameter/value@parameter_id`] === undefined
						? [attrsWithId[existingIndex].id]
						: [...acc[`/parameters/parameter/value@parameter_id`], attrsWithId[existingIndex].id];
				// acc[`/parameters/parameter/value@value_id`].push();
				acc[`/parameters/parameter/value@name[pol]`] =
					acc[`/parameters/parameter/value@name[pol]`] === undefined ? [attribute.value] : [...acc[`/parameters/parameter/value@name[pol]`], attribute.value];
				acc[`/parameters/parameter/value@priority`] = acc[`/parameters/parameter/value@priority`] === undefined ? [index] : [...acc[`/parameters/parameter/value@priority`], index];
				return acc;
			}, {});

			return {
				[`@id`]: variantId,
				[`/sizes/size@code_external`]: sku,
				[`/sizes/size@code_producer`]: ean,
				[`/description/name[pol]`]: title[language],
				[`/description/long_desc[pol]`]: getDescription(description, language, producer),
				[`@type`]: `regular`,
				[`@vat`]: `23`,
				[`@country_of_origin`]: `Polska`,
				[`/producer@name`]: producer,
				// [`/warranty@name[pol]`]: ``,
				[`@code_on_card`]: sku,
				// [`/series@name`]: ``,
				// [`/category@name[pol]`]: ``,
				[`@producer_code_standard`]: `GTIN13`,
				// [`/price_retail/site@id`]: `1`,
				// [`/price_retail/site@size_id`]: `4`,
				[`/price_retail_base@gross`]: parseFloat(sellPrice[language].price.toFixed(2)),
				[`/price_retail_base@net`]: parseFloat((sellPrice[language].price / 1.23).toFixed(2)),
				[`@currency`]: `PLN`,
				[`/sizes@group_id`]: `4`,
				[`/sizes@group_name`]: `Warianty`,
				[`/sell_by/retail@quantity`]: ``,
				[`/sell_by/wholesale@quantity`]: ``,
				[`/inwrapper@quantity`]: ``,
				[`/sizes/size@id`]: `0`,
				[`/sizes/size@name`]: `---`,
				[`/sizes/size@weight`]: parseFloat(weight),
				[`/sizes/size@weight_net`]: parseFloat(weight),
				[`/availability_management@value`]: `manual`,
				[`/sizes/size/stock@stock_id`]: `1`,
				[`/sizes/size/stock@quantity`]: stock,
				[`/availability/site@id`]: `1`,
				[`/availability/site@value`]: `yes`,
				[`/parameters/parameter@id`]: (attributesCombined[`/parameters/parameter@id`] === undefined ? [] : attributesCombined[`/parameters/parameter@id`]).join('\n'),
				[`/parameters/parameter@priority`]: (attributesCombined[`/parameters/parameter@priority`] === undefined ? [] : attributesCombined[`/parameters/parameter@priority`]).join('\n'),
				[`/parameters/parameter@name[pol]`]: (attributesCombined[`/parameters/parameter@name[pol]`] === undefined ? [] : attributesCombined[`/parameters/parameter@name[pol]`]).join('\n'),
				[`/parameters/parameter@type`]: (attributesCombined[`/parameters/parameter@type`] === undefined ? [] : attributesCombined[`/parameters/parameter@type`]).join('\n'),
				[`/parameters/parameter/value@parameter_id`]: (attributesCombined[`/parameters/parameter/value@parameter_id`] === undefined
					? []
					: attributesCombined[`/parameters/parameter/value@parameter_id`]
				).join('\n'),
				// [`/parameters/parameter/value@value_id`]: [],
				[`/parameters/parameter/value@name[pol]`]: (attributesCombined[`/parameters/parameter/value@name[pol]`] === undefined
					? []
					: attributesCombined[`/parameters/parameter/value@name[pol]`]
				).join('\n'),
				[`/parameters/parameter/value@priority`]: (attributesCombined[`/parameters/parameter/value@priority`] === undefined
					? []
					: attributesCombined[`/parameters/parameter/value@priority`]
				).join('\n'),
				[`/images/large/image@url`]: imagesUrl(images, language, aliases).join('\n'),
			};
		})
		.filter(Boolean);

	return {
		products,
		language,
	};
};

export const generateLoristoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await loristoFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'loristo', 'csv', '../generate/feed/', ',');
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
