import { tariff } from '../../../../data/tariff.js';
import { newConfig } from '../../../../config/config.js';
import { stripHtml } from 'string-strip-html';
export const mapSimpleData = (data) => {
	if (data[0]?.$alias === undefined) {
		return tariff.reduce((prev, curr) => {
			const dataIndex = data.findIndex((d) => d.$lang === curr.lang);
			if (dataIndex === -1) {
				return {
					...prev,
					[`${curr.lang}`]: '',
				};
			}
			return {
				...prev,
				[`${curr.lang}`]: data[dataIndex].$ === undefined ? '' : data[dataIndex].$ === '---' ? '' : stripHtml(data[dataIndex].$).result,
			};
		}, {});
	} else {
		return tariff.reduce((prev, curr) => {
			const dataIndex = data.filter((d) => d.$alias === '6').findIndex((d) => d.$lang === curr.lang);

			if (dataIndex === -1) {
				return {
					...prev,
					[`${curr.lang}`]: '',
				};
			}
			return {
				...prev,

				[`${curr.lang}`]: data[dataIndex].$ === undefined ? '' : data[dataIndex].$ === '---' ? '' : stripHtml(data[dataIndex].$).result,
			};
		}, {});
	}
};
export const mapDescriptions = (data, allAliases) => {
	const descriptions = (rawData, description) => {
		if (rawData.length !== 0) {
			if (rawData.length === undefined) {
				return [`${rawData.$}`];
			} else {
				return rawData.map((desc) => {
					if (description === '') return '';
					return `${desc.$}`;
				})[0];
			}
		}
		return '';
	};
	const aliases = (configData, lang) => {
		return ['Rea', 'Tutumi', 'Toolight'].reduce((prev, curr) => {
			if (data.length !== 0) {
				const filteredDescriptions = data.description.filter((desc) => {
					return mapAliases(desc.$alias, allAliases)[0] === curr && lang === desc.$lang;
				});
				const description = descriptions(filteredDescriptions, curr);
				return {
					...prev,
					[`${curr}`]: description === undefined ? '' : description,
				};
			} else {
				return {
					...prev,
					[`${curr}`]: '',
				};
			}
		}, {});
	};
	if (data.length !== undefined) {
		return newConfig.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.code}`]: aliases(newConfig, curr.code),
			};
		}, {});
	} else {
		return newConfig.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.code}`]: aliases(newConfig, curr.code),
			};
		}, {});
	}
};
export const mapAliases = (productAliases, allAliases) => {
	if (productAliases.length === 0) return [];
	return productAliases
		.split(';')
		.map((alias) => {
			const aliasesId = allAliases.findIndex((a) => a.id === parseInt(alias));
			if (aliasesId === -1) return;
			return allAliases[aliasesId].name;
		})
		.filter(Boolean);
};
export const mapCategories = (data, categories) => {
	const makeCategoryPath = (categoryId, categories, lang) => {
		const catPath = [];
		const createPath = (id, cats) => {
			const categoryExistIndex = cats.findIndex((cat) => cat.id === parseInt(id));
			if (categoryExistIndex === -1) return;
			if (isNaN(categories[categoryExistIndex].parentId)) {
				return catPath.push({
					id: categories[categoryExistIndex].id,
					parentId: 1,
					name: categories[categoryExistIndex].name[lang],
				});
			} else {
				catPath.push({
					id: categories[categoryExistIndex].id,
					parentId: categories[categoryExistIndex].parentId,
					name: categories[categoryExistIndex].name[lang],
				});
				return createPath(
					categories[categoryExistIndex].parentId,

					categories
				);
			}
		};
		createPath(categoryId, categories);
		return catPath.reverse();
	};

	if (data.length === undefined) {
		if (data.category.length === undefined) {
			return newConfig.reduce((prev, curr) => {
				return {
					...prev,
					[`${curr.code}`]: makeCategoryPath(data.category.$id, categories, curr.code),
				};
			}, {});
		} else {
			return newConfig.reduce((prev, curr) => {
				return {
					...prev,
					[`${curr.code}`]: data.category.map((c) => makeCategoryPath(c.$id, categories, curr.code)),
				};
			}, {});
		}
		if (data.category.length === 0) {
			console.log('KATEGORIE DO ZMAPOWANIA');
		}
	} else {
		return newConfig.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.code}`]: [],
			};
		}, {});
	}
};
export const mapImages = (data) => {
	const images = (rawData, url) => {
		if (rawData.length !== 0) {
			if (rawData.image.length === undefined) {
				return [rawData.image.$url];
			} else {
				return rawData.image.map((img) => img.$url);
			}
		}
		return [];
	};

	return images(data);
};
export const mapPrices = (data) => {
	const preparedPrices = [];
	if (data.length !== 0) {
		if (data.price.length !== undefined) {
			preparedPrices.push(
				...data.price.map((price) => ({
					tariff: parseInt(price.$tariff_strategy),
					tax: parseInt(price.$tax),
					price: parseFloat(price.$gross),
				}))
			);
		} else {
			preparedPrices.push({
				tariff: parseInt(data.price.$tariff_strategy),
				tax: parseInt(data.price.$tax),
				price: parseFloat(data.price.$gross),
			});
		}
	}
	return tariff
		.map((tar) => {
			const priceId = preparedPrices.findIndex((price) => price.tariff === tar.tariff);
			if (priceId !== -1) {
				return {
					tariff: tar.tariff,
					tax: tar.tax,
					price: preparedPrices[priceId].price,
					currency: tar.currency,
					lang: tar.lang,
				};
			}
			return {
				tariff: tar.tariff,
				tax: tar.tax,
				price: 0,
				currency: tar.currency,
				lang: tar.lang,
			};
		})
		.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.lang}`]: {
					price: curr.price,
					tax: curr.tax,
					currency: curr.currency,
				},
			};
		}, {});
};
export const mapProducers = (producerId, producers) => {
	const index = producers.findIndex((p) => p.id === parseInt(producerId));
	return index !== -1 ? producers[index].name : '';
};
export const mapUrls = (data, allAliases) => {
	const urls = (rawData, url) => {
		if (rawData.length !== 0) {
			if (rawData.length === undefined) {
				return [`${rawData.$}`];
			} else {
				return rawData.map((u) => {
					if (url === '') return '';
					return `${u.$}`;
				})[0];
			}
		}
		return '';
	};
	const aliases = (configData, lang) => {
		const index = configData.findIndex((d) => d.code === lang);
		return configData[index].urls.reduce((prev, curr) => {
			if (data.length !== 0) {
				const filteredUrls = data.url.filter((d) => {
					return mapAliases(d.$alias, allAliases)[0] === curr.alias && lang === d.$lang;
				});
				return {
					...prev,
					[`${curr.alias}`]: urls(filteredUrls, curr.url),
				};
			}
			return {
				...prev,
				[`${curr.alias}`]: '',
			};
		}, {});
	};
	if (data.length !== undefined) {
		return newConfig.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.code}`]: aliases(newConfig, curr.code),
			};
		}, {});
	} else {
		return newConfig.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.code}`]: aliases(newConfig, curr.code),
			};
		}, {});
	}
};
export const mapProfiles = (data, profiles, profileFields, profileFieldsChoices) => {
	const makeProfiles = (currentField, lang) => {
		const fieldId = parseInt(currentField.$id);
		const profileId = parseInt(currentField.$profile);
		const profileField = profileFields.filter((pr) => pr.id === fieldId).filter((pr) => pr.profileId === profileId);
		let profileValue = '';

		if (profileField.length !== 0) {
			if (Object.prototype.hasOwnProperty.call(currentField, 'value')) {
				if (currentField.value.length !== 0) {
					if (currentField.$type === 'text_line') {
						if (Object.prototype.hasOwnProperty.call(currentField.value[currentField.value.findIndex((v) => v.$lang === lang)], '$')) {
							profileValue = currentField.value[currentField.value.findIndex((v) => v.$lang === lang)].$;
						}
					}
					if (currentField.$type === 'yes_no') {
						profileValue = currentField.value === 'YES' ? '1' : '0';
					}
					if (currentField.$type === 'choice') {
						const profileFieldChoice = profileFieldsChoices.filter((pr) => pr.id === parseInt(currentField.value)).filter((pr) => pr.fieldId === fieldId);
						if (profileFieldChoice.length !== 0) {
							if (Object.prototype.hasOwnProperty.call(profileFieldChoice[0], 'name')) {
								profileValue = profileFieldChoice[0].name[lang];
							}
						}
					}
					if (currentField.$type === 'number') {
						profileValue = currentField.value;
					}
					if (currentField.$type === 'multiple_choice') {
						profileValue = currentField.value
							.split(';')
							.map((v) => {
								const profileFieldMultipleChoice = profileFieldsChoices.filter((pr) => pr.id === parseInt(v)).filter((pr) => pr.fieldId === fieldId);
								if (profileFieldMultipleChoice.length !== 0) {
									if (Object.prototype.hasOwnProperty.call(profileFieldMultipleChoice[0], 'name')) {
										return (
											profileFieldMultipleChoice[0].name[lang].slice(0, 1).toUpperCase() +
											profileFieldMultipleChoice[0].name[lang].slice(1, profileFieldMultipleChoice[0].name[lang].length)
										);
									}
								} else {
									return '';
								}
							})
							.join(', ');
					}
					if (currentField.$type === 'text_box') {
						if (Object.prototype.hasOwnProperty.call(currentField.value[currentField.value.findIndex((v) => v.$lang === lang)], '$')) {
							profileValue = currentField.value[currentField.value.findIndex((v) => v.$lang === lang)].$;
						}
					}
					if (currentField.$type === 'header') {
						if (Object.prototype.hasOwnProperty.call(currentField.value[currentField.value.findIndex((v) => v.$lang === lang)], '$')) {
							profileValue = currentField.value[currentField.value.findIndex((v) => v.$lang === lang)].$;
						}
					}
				}
			}

			return {
				lang,
				name: profileField[0].name[lang],
				value: profileValue,
			};
		} else {
			return {
				lang,
				name: '',
				value: '',
			};
		}
	};
	if (data.length === undefined) {
		if (data.field.length !== undefined) {
			return newConfig.reduce((prev, curr) => {
				return {
					...prev,
					[`${curr.code}`]: data.field.map((d) => makeProfiles(d, curr.code)),
				};
			}, {});
		} else {
			return newConfig.reduce((prev, curr) => {
				return {
					...prev,
					[`${curr.code}`]: makeProfiles(data.field, curr.code),
				};
			}, {});
		}
	} else {
		return newConfig.reduce((prev, curr) => {
			return {
				...prev,
				[`${curr.code}`]: [],
			};
		}, {});
	}
};
export const mapProfilesValues = (data) => {
	if (data.length === undefined) {
		if (data.field.length !== undefined) {
			return data.field.map((item) => {
				return {
					id: parseInt(item.$id),
					type: item.$type,
					value:
						item.value === undefined
							? []
							: typeof item.value === 'string'
								? item.value.split(';')
								: item.value.map((val) => ({
										lang: val.$lang,
										value: val.$ === undefined ? '' : val.$,
									})),
				};
			});
		} else {
			return [
				{
					id: parseInt(data.field.$id),
					type: data.field.$type,
					value:
						data.field.value === undefined
							? []
							: typeof data.field.value === 'string'
								? data.field.value.split(';')
								: data.field.value.map((val) => ({
										lang: val.$lang,
										value: val.$ === undefined ? '' : val.$,
									})),
				},
			];
		}
	} else {
		return [];
	}
};
export const mapProductFiles = (data, allAliases) => {
	if (data.length === 0) return [];
	if (data.file !== undefined) {
		if (data.file.length === undefined) {
			return {
				fileName: data.file.$fileName,
				url: data.file.$url,
				visibleInAliases: mapAliases(data.file.$visibleInAliases, allAliases),
				visibleInLanguages: data.file.$visibleInLanguages.split(';'),
			};
		}
		if (data.file.length === 0) return [];
		return data.file.map((item) => {
			return {
				fileName: item.$fileName,
				url: item.$url,
				visibleInAliases: mapAliases(item.$visibleInAliases, allAliases),
				visibleInLanguages: item.$visibleInLanguages.split(';'),
			};
		});
	}
};
