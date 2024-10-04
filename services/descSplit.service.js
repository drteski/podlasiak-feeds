import ObjectsToCsv from 'objects-to-csv-file';
import dotenv from 'dotenv';
import replaceEntities from '../utilities/decodeText.utility.js';
import csvtojson from 'csvtojson';

dotenv.config({ path: '../.env' });

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
const descriptionSplitter = (description) => {
	if (description.length === 0) return ['', ''];
	if (description.length <= 200) return [description, ''];
	const dotIndexes = [];
	description.split('').forEach((des, index) => {
		if (des !== '.') return;
		dotIndexes.push(index);
	});
	const half = Math.floor(description.length / 2);
	const firstPart = description.slice(
		0,
		dotIndexes[dotIndexes.indexOf(findClosest(dotIndexes, half))] + 1
	);
	const secondPart = description.slice(
		dotIndexes[dotIndexes.indexOf(findClosest(dotIndexes, half))] + 1,
		-1
	);
	return [firstPart, secondPart];
};

const generateJanekCsv = async () => {
	const parsedFile = await csvtojson()
		.fromFile('../generate/rumunia.csv')
		.then((json) => {
			return json;
		});
	const fileToSave = [];
	parsedFile.forEach((data) => {
		const tag = replaceEntities(
			data['Metafield: description_tag [string]']
		);
		const first = replaceEntities(
			data['Metafield: custom']['first_description_row ']
				.single_line_text_field
		);
		const second = replaceEntities(
			data['Metafield: custom']['second_description_row ']
				.single_line_text_field
		);
		fileToSave.push({
			Handle: data.Handle,
			'Body HTML': data['Body HTML'],
			Vendor: data.Vendor,
			'Metafield: description_tag [string]': tag,
			'Metafield: custom.first_description_row [single_line_text_field]':
				first,
			'Metafield: custom.second_description_row [single_line_text_field]':
				second,
		});
	});

	//
	const csv = new ObjectsToCsv(fileToSave);
	await csv.toDisk(`../generate/rumunia_poprawiona.csv`, { delimiter: ',' });
};
// generateJanekCsv();
