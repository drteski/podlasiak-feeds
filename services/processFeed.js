import axios from 'axios';
import fs from 'fs';
import Product from '../models/Product.js';
import builder from 'xmlbuilder2';
import { currencyDefaults, newConfig } from '../config/config.js';
import entities from '../data/entities.js';
import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';
import ftp from 'basic-ftp';
import path from 'path';
dotenv.config({ path: '../.env' });

const { FTP_HOST, FTP_PORT, FTP_USER, FTP_PASS, FTP_LOCATION } = process.env;

export const getCurrencyRates = async (currency) => {
	return new Promise(async (resolve, reject) => {
		return await axios
			.get(`http://api.nbp.pl/api/exchangerates/rates/A/${currency}/`)
			.then((res) => resolve(res.data.rates[0].mid))
			.catch(() => {
				return reject(currencyDefaults[currency]);
			});
	});
};

export const getProducts = async () => {
	return new Promise(async (resolve, reject) => {
		const products = await Product.find().catch((error) => reject(error));

		const data = products.map((product) => {
			const {
				uid,
				id,
				active,
				variantId,
				activeVariant,
				sku,
				ean,
				weight,
				stock,
				producer,
				aliases,
				title,
				description,
				variantName,
				basePrice,
				sellPrice,
				images,
				category,
				url,
				attributes,
			} = product;
			return {
				uid,
				id,
				active,
				variantId,
				activeVariant,
				sku,
				ean,
				weight,
				stock,
				producer,
				aliases,
				title: title[0],
				description: description[0],
				variantName: variantName[0],
				basePrice: basePrice[0],
				sellPrice: sellPrice[0],
				images,
				category: category[0],
				url: url[0],
				attributes: attributes[0],
			};
		});
		resolve(data);
	});
};
export const aliasesFilter = (products, aliases) => {
	return products.filter((product) =>
		product.aliases.some((alias) => aliases.includes(alias))
	);
};
export const xmlBuilider = async (data, cb) => {
	const { products, language } = data;
	const root = builder;
	return {
		products: cb(products, root).end({
			format: 'xml',
			prettyPrint: true,
		}),
		language,
	};
};

export const getStoreUrl = (lang, alias) => {
	const store = newConfig.filter((config) => config.code === lang);
	return store[0].urls.filter((url) => url.alias === alias)[0].url;
};

export const saveFeedFileToDisk = async (
	data,
	name,
	format,
	location,
	delimiter = ';',
	chunks = false
) => {
	return new Promise(async (resolve, reject) => {
		const { products, language } = data;
		if (!chunks) {
			if (format === 'xml') {
				await fs.writeFile(
					`${location}${name}_${language}.${format}`,
					products,
					'utf8',
					(error) => {
						if (error) {
							reject(error);
						}
					}
				);
			}
			if (format === 'csv') {
				const csv = new ObjectsToCsv(products);
				await csv.toDisk(`${location}${name}_${language}.${format}`, {
					delimiter,
				});
			}
			if (format === 'json') {
				await fs.writeFile(
					`${location}${name}_${language}.${format}`,
					JSON.stringify(products),
					'utf8',
					(error) => {
						if (error) {
							reject(error);
						}
					}
				);
			}
		} else {
			if (format === 'csv') {
				for await (const [index, chunk] of products.entries()) {
					const csv = new ObjectsToCsv(chunk);
					await csv.toDisk(
						`${location}${name}_${language}_${index + 1}.${format}`,
						{
							delimiter,
						}
					);
				}
			}
		}
		return resolve();
	});
};

export const titleWithVariantName = (title, variantName) => {
	const preparedTitle = title
		.split(' ')
		.filter((word) => word !== '')
		.map((word) => {
			if (word === 'XL' || word === 'XXL' || word === 'XS') return word;
			if (word.match(/app\d{1,}-\d{1,2}[a-z]{0,3}/gim))
				return word.toUpperCase();
			return (
				word[0].toUpperCase() + word.slice(1, word.length).toLowerCase()
			);
		})
		.join(' ');

	// const regex = /\d+/gm;
	const variantMatch = variantName.match(/\d+/gm);
	// const titleMatch = preparedTitle.match(/\d{1,}x\d{1,}/gm);
	// let newTitle = '';
	let newVariantName = '';
	if (variantMatch !== null) {
		if (variantMatch.length < 2) {
			if (variantMatch[0][0] !== '0') {
				if (variantMatch[0].length !== 4) {
					if (parseInt(variantMatch[0]) < 50) {
						if (variantName.match(/\([\d]+\)/gm)) {
							newVariantName = variantName
								.replace(/\s\([\d]+\)/gm, '')
								.replace(/\([\d]+\)/gm, '');
						}
						if (
							!isNaN(
								parseInt(
									variantName
										.replace(' "N"', '')
										.replace(' "n"', '')
								)
							)
						) {
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
					if (parseInt(variantMatch[0]) < 10)
						newVariantName = variantName;
					if (variantName.match(/\d{1,}\s*-\s*\d{1,}/gm))
						newVariantName = variantName;
					newVariantName = variantMatch.join('x');
				} else {
					if (variantName.match(/\d{1,}\s*-\s*\d{1,}/gm))
						newVariantName = variantName;
					newVariantName = variantName;
				}
			} else {
				if (variantMatch[0][0] === '0') newVariantName = variantName;
				if (parseInt(variantMatch[0]) < 10)
					newVariantName = variantName;
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
					if (word === 'XL' || word === 'XXL' || word === 'XS')
						return word;
					return (
						word[0].toUpperCase() +
						word.slice(1, word.length).toLowerCase()
					);
				})
				.join(' ');
		newVariantName = variantName;
	}
	// 	if (titleMatch !== null) {
	// 		// if (titleMatch.length < 2) {
	// 		// 	if (titleMatch[0][0] !== '0') {
	// 		// 		if (titleMatch[0].length !== 4) {
	// 		// 			if (parseInt(titleMatch[0]) < 50) {
	// 		// 				if (variantName.match(/\([\d]+\)/gm)) {
	// 		// 					newTitle = variantName
	// 		// 						.replace(/\s\([\d]+\)/gm, '')
	// 		// 						.replace(/\([\d]+\)/gm, '');
	// 		// 				}
	// 		// 				if (
	// 		// 					!isNaN(
	// 		// 						parseInt(
	// 		// 							variantName
	// 		// 								.replace(' "N"', '')
	// 		// 								.replace(' "n"', '')
	// 		// 						)
	// 		// 					)
	// 		// 				) {
	// 		// 					newTitle = '';
	// 		// 				} else {
	// 		// 					newTitle = variantName;
	// 		// 				}
	// 		// 			} else {
	// 		// 				newTitle = titleMatch[0];
	// 		// 			}
	// 		// 		} else {
	// 		// 			newTitle = variantName;
	// 		// 		}
	// 		// 	} else {
	// 		// 		newTitle = variantName;
	// 		// 	}
	// 		// } else {
	// 		// 	if (titleMatch.length >= 3) {
	// 		// 		if (titleMatch.length === 3) {
	// 		// 			if (variantName.match(/\d{1,}x\d{1,}x\d{1,}/gm)) {
	// 		// 				newTitle = variantName;
	// 		// 			}
	// 		// 			if (parseInt(titleMatch[0]) < 10) newTitle = variantName;
	// 		// 			if (variantName.match(/\d{1,}\s*-\s*\d{1,}/gm))
	// 		// 				newTitle = variantName;
	// 		// 			newTitle = titleMatch.join('x');
	// 		// 		} else {
	// 		// 			if (variantName.match(/\d{1,}\s*-\s*\d{1,}/gm))
	// 		// 				newTitle = variantName;
	// 		// 			newTitle = variantName;
	// 		// 		}
	// 		// 	} else {
	// 		// 		if (titleMatch[0][0] === '0') newTitle = variantName;
	// 		// 		if (parseInt(titleMatch[0]) < 10) newTitle = variantName;
	// 		// 		newTitle = titleMatch.join('x');
	// 		// 	}
	// 		// }
	// 		console.log(
	// 			preparedTitle.replace(` ${newVariantName}`, ''),
	// 			titleMatch,
	// 			' ',
	// 			newVariantName
	// 		);
	// 	} else {
	// 		// if (variantName !== '')
	// 		// 	newTitle = variantName
	// 		// 		.replace(' / ', '/')
	// 		// 		.replace('/', ' / ')
	// 		// 		.replace(',', '')
	// 		// 		.split(' ')
	// 		// 		.filter((word) => word !== '')
	// 		// 		.map((word) => {
	// 		// 			if (word === 'XL' || word === 'XXL' || word === 'XS')
	// 		// 				return word;
	// 		// 			return (
	// 		// 				word[0].toUpperCase() +
	// 		// 				word.slice(1, word.length).toLowerCase()
	// 		// 			);
	// 		// 		})
	// 		// 		.join(' ');
	// 		// newTitle = variantName;
	// 	}
	//
	// 	// console.log(`${newTitle} ${newVariantName}`);
	return `${preparedTitle} ${newVariantName}`;
};

export const replaceEntities = (data) => {
	const toCheck = data.replace(/[\r\n]/gm, '').split(' ');
	return toCheck
		.map((check) => {
			let newWord = check;
			entities.forEach((entitie) => {
				const regex = new RegExp(entitie.entitiyName, 'gm');
				if (check.match(regex)) {
					newWord = check.replace(regex, entitie.char);
				}
			});
			return newWord;
		})
		.join(' ');
};

export const productsChunker = (data, chunks) => {
	const totalFiles = Math.ceil(data.length / chunks);
	const productsChunks = [];
	for (let index = 0; index < totalFiles; index++) {
		productsChunks.push(data.slice(index * chunks, (index + 1) * chunks));
	}
	return productsChunks;
};
export const uploadFeeds = async (localFiles, bar) => {
	return new Promise(async (resolve, reject) => {
		const client = new ftp.Client();
		const dirSize = async (directory) => {
			const files = fs.readdirSync(directory);
			const stats = files.map((file) =>
				fs.statSync(path.join(directory, file))
			);

			return (await Promise.all(stats)).reduce(
				(accumulator, { size }) => accumulator + size,
				0
			);
		};
		const size = await dirSize(localFiles);
		const sizeInMB = Math.floor(parseFloat(size) / 1000000);
		bar.start(sizeInMB, 0, {
			dane: 'Przesyłanie do FTP',
			additionalData: '',
		});

		client.trackProgress((info) => {
			const currentProgress = Math.floor(
				parseFloat(info.bytesOverall) / 1000000
			);
			bar.update(currentProgress, {
				dane: 'Przesyłanie do FTP',
				additionalData: ` ${currentProgress}/${sizeInMB} Mb •`,
			});
		});

		await client.access({
			host: FTP_HOST,
			port: FTP_PORT,
			user: FTP_USER,
			password: FTP_PASS,
			secure: false,
		});
		await client.uploadFromDir(localFiles, FTP_LOCATION).catch((error) => {
			if (error.code === 'ETIMEOUT') {
				return uploadFeeds(localFiles, bar);
			} else {
				reject(error);
			}
		});
		bar.update(0, {
			dane: 'Przesłano do FTP',
			additionalData: ``,
		});
		client.close();

		resolve();
	});
};

export const addMuToPrice = (price, mu) => parseFloat(price) * (mu / 100 + 1);
