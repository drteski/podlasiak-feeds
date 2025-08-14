import { getStoreUrl, saveFeedFileToDisk } from '../../processFeed.js';
import { generateSubiektB2BFeed } from '../subiekt/subiektFeed.js';
import { connectToGoogleSheets, getDataFromSheets } from '../../../utilities/googleSheets.js';
import convert from 'xml-js';
import axios from 'axios';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';

const toolightB2BFeed = async (data, language) => {
	const subiektProducts = await generateSubiektB2BFeed();
	const dimensions = await connectToGoogleSheets('1uXVoUeXeZyb198Za88ERRaDX5KYr_tV_rgt1sFcrlCQ').then((document) => getDataFromSheets(document, 'WYMIARY').then((data) => data));
	const b2bRea = await Promise.all([
		(async () => {
			return new Promise((resolve) => {
				(async () => {
					const xml = await axios
						.get('https://b2b.reahurt.pl/pl/xmlapi/333/3/utf8/9019aed7-15be-48e2-b7b9-8ea51584b7e8', {
							timeout: 0,
							responseType: 'text',
						})
						.then((res) => res.data);
					const result = convert.xml2json(xml, {
						compact: true,
						spaces: 4,
					});
					resolve(JSON.parse(result));
				})();
			});
		})(),
	]);

	const products = subiektProducts
		.map((product) => {
			const { id, b2b, sku, ean, stock, title, productGroup } = product;
			const dimensionMap = dimensions
				.filter((dimension) => dimension['sku\nSKU'].replace(/\s/gm, '').toLowerCase() === sku.toLowerCase())
				.map((d) => {
					return {
						length: d['length\nDŁUGOŚĆ\n[mm]'],
						width: d['width\nSZEROKOŚĆ\n[mm]'],
						height: d['height\nWYSOKOŚĆ\n[mm]'],
						package_length: d['package_length\nDŁUGOŚĆ OPAKOWANIA\n[mm]'],
						package_width: d['package_width\nSZEROKOŚĆ OPAKOWANIA\n[mm]'],
						package_height: d['package_height\nWYSOKOŚĆ OPAKOWANIA\n[mm]'],
						weight_nett: d['weightNett\nWAGA NETTO\n[kg]'],
						weight_gross: d['weightGross\nWAGA BRUTTO\n[kg]'],
					};
				});
			const sizes =
				dimensionMap.length === 0
					? {
							length: '',
							width: '',
							height: '',
							package_length: '',
							package_width: '',
							package_height: '',
							weight_nett: '',
							weight_gross: '',
						}
					: dimensionMap[0];
			const b2bData = b2bRea[0].products.product.filter((p) => p.sku._cdata.replace(/\s/gm, '').toLowerCase() === sku.toLowerCase());
			const merceProductMap = data
				.filter((product) => product.sku.replace(/\s/gm, '').toLowerCase() === sku.toLowerCase())
				.map((p) => {
					const { sku, ean, title, producer, description, variantName, stock, images, attributes } = p;
					const storeUrl = getStoreUrl('pl', 'Toolight');
					const parameters = Object.entries(attributes)
						.filter(([key, value]) => language.some((lang) => key === lang))
						.map(([key, value]) => {
							return language.some((lang) => key === lang)
								? {
										lang: key,
										value:
											value.length === undefined
												? [{ name: value.name, value: value.value }]
												: value
														.map((v) => {
															if (v.name !== 'Informations sur la livraison' || v.name !== 'Informacja o dostawie' || v.name !== 'Additional description')
																return {
																	name: v.name,
																	value: v.value,
																};
														})
														.filter(Boolean),
									}
								: { lang: key, value: [] };
						})
						.reduce(
							(prev, curr) => ({
								...prev,
								[curr.lang]: curr.value,
							}),
							{}
						);
					const descriptions = Object.entries(description)
						.filter(([key, value]) => language.some((lang) => key === lang))
						.map(([key, value]) =>
							language.some((lang) => key === lang)
								? {
										lang: key,
										value: value.Toolight,
									}
								: {
										lang: key,
										value: '',
									}
						)
						.reduce(
							(prev, curr) => ({
								...prev,
								[curr.lang]: curr.value,
							}),
							{}
						);
					const titles = Object.entries(title)
						.filter(([key, value]) => language.some((lang) => key === lang))
						.map(([key, value]) =>
							language.some((lang) => key === lang)
								? {
										lang: key,
										value: value,
									}
								: {
										lang: key,
										value: '',
									}
						)
						.reduce(
							(prev, curr) => ({
								...prev,
								[curr.lang]: curr.value,
							}),
							{}
						);
					const variantNames = Object.entries(variantName)
						.filter(([key, value]) => language.some((lang) => key === lang))
						.map(([key, value]) =>
							language.some((lang) => key === lang)
								? {
										lang: key,
										value: value,
									}
								: {
										lang: key,
										value: '',
									}
						)
						.reduce(
							(prev, curr) => ({
								...prev,
								[curr.lang]: curr.value,
							}),
							{}
						);

					return {
						ean,
						titles,
						variantNames,
						descriptions,
						producer,
						stock,
						images: images.map((image) => storeUrl + 'picture/' + image),
						parameters,
					};
				});
			const merceProduct =
				merceProductMap.length === 0
					? {
							sku: '',
							ean: '',
							titles: language.reduce(
								(prev, curr) => ({
									...prev,
									[curr]: '',
								}),
								{}
							),
							variantNames: language.reduce(
								(prev, curr) => ({
									...prev,
									[curr]: '',
								}),
								{}
							),
							descriptions: language.reduce(
								(prev, curr) => ({
									...prev,
									[curr]: '',
								}),
								{}
							),
							producer: '',
							images: [],
							parameters: language.reduce(
								(prev, curr) => ({
									...prev,
									[curr]: '',
								}),
								{}
							),
						}
					: merceProductMap[0];

			return {
				id,
				b2b,
				sku,
				ean: merceProduct.ean === '' ? ean : merceProduct.ean,
				stock,
				b2bUrl: b2bData.length > 0 ? b2bData[0].url._cdata : '',
				subiektTitle: title,
				productGroup,
				...sizes,
				...merceProduct,
			};
		})
		.filter(Boolean);
	return {
		products,
		language: language.join('_'),
	};
};

export const generateToolightB2BFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		await toolightB2BFeed(products, config.languages, config).then(async (data) => {
			await saveFeedFileToDisk(data, 'toolight-catalog', 'json', '../generate/feed/');
		});
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
