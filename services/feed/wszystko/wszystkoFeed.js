import { getStoreUrl, saveFeedFileToDisk } from '../../processFeed.js';
import { getDescription } from '../../../utilities/descriptions.js';

const wszystkoFeed = async (data, language) => {
	const headers = data
		.sort((a, b) => b.images.length - a.images.length)
		.map((product) => {
			const { variantId, images, attributes } = product;

			const imagesObj = images.reduce((prev, curr, index) => {
				return {
					...prev,
					[`img_${index + 1}`]: '',
				};
			}, {});

			const attributesObj =
				attributes[language].length === undefined
					? [attributes[language]].reduce((prev, curr) => {
							if (curr.name === '') console.log(curr.name, variantId);
							return {
								...prev,
								[`${curr.name}`]: '',
							};
						}, {})
					: attributes[language].reduce((prev, curr) => {
							if (curr.name === '') console.log(curr.name, variantId);
							return {
								...prev,
								[`${curr.name}`]: '',
							};
						}, {});

			return {
				active: '',
				id: '',
				activeVariant: '',
				variantId: '',
				sku: '',
				ean: '',
				weight: '',
				stock: '',
				producer: '',
				aliases: '',
				title: '',
				description: '',
				variantName: '',
				basePrice: '',
				sellPrice: '',
				tax: '',
				currency: '',
				category: '',
				url: '',
				...imagesObj,
				...attributesObj,
			};
		})
		.reduce((prev, curr) => {
			return {
				...prev,
				...curr,
			};
		}, {});

	const productsAllData = data.reduce((prev, curr) => {
		const { active, id, activeVariant, variantId, sku, ean, weight, stock, producer, aliases, title, description, variantName, basePrice, sellPrice, category, url, attributes, images } = curr;

		const storeUrl = getStoreUrl(language, 'Rea');

		const attributesObj =
			attributes[language].length === undefined
				? [attributes[language]].reduce(
						(prev, curr) => ({
							...prev,
							[`${curr.name}`]: curr.value,
						}),
						{}
					)
				: attributes[language].reduce(
						(prev, curr) => ({
							...prev,
							[`${curr.name}`]: curr.value,
						}),
						{}
					);

		return [
			...prev,
			{
				...headers,
				active: active ? '1' : '0',
				id,
				activeVariant: activeVariant ? '1' : '0',
				variantId,
				sku,
				ean,
				weight,
				stock,
				producer,
				aliases: aliases.join(', '),
				title: title[language],
				description: getDescription(description, language, producer),
				variantName: variantName[language],
				basePrice: basePrice[language].price,
				sellPrice: sellPrice[language].price,
				tax: basePrice[language].tax,
				currency: basePrice[language].currency,
				category:
					category[language][0] === undefined
						? ''
						: category[language][0].length === undefined
							? [category[language][0]].map((cat) => cat.name).join(' > ')
							: category[language][0].map((cat) => cat.name).join(' > '),
				url: storeUrl + url[language]['Rea'],
				...images.reduce(
					(prev, curr, index) => ({
						...prev,
						[`img_${index + 1}`]: storeUrl + 'picture/' + curr,
					}),
					{}
				),
				...attributesObj,
			},
		];
	}, []);
	return { products: productsAllData, language };
};

export const generateWszystkoFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await wszystkoFeed(products, language).then(async (data) => {
				await saveFeedFileToDisk(data, 'wszystko', 'csv', '../generate/feed/');
			});
		}
		resolve();
	});
};
