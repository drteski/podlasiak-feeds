import downloadHandler from '../utilities/downloadCsv.utility.js';
import csvtojson from 'csvtojson';
import ObjectsToCsv from 'objects-to-csv-file';
import { format } from 'date-fns';

const file = await downloadHandler(
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vR35n7f9gaQbp4HAG07E1fNvTUYv6YL6oKlRGc0LQRZcgK-0auxtaCZQkueNwfwL8r81_FaRtAfAcBr/pub?gid=248476708&single=true&output=csv',
	'../generate/janek/',
	'janek.csv'
);

const getFile = () => {
	return new Promise(async (resolve, reject) => {
		const file = await downloadHandler(
			'https://docs.google.com/spreadsheets/d/e/2PACX-1vR35n7f9gaQbp4HAG07E1fNvTUYv6YL6oKlRGc0LQRZcgK-0auxtaCZQkueNwfwL8r81_FaRtAfAcBr/pub?gid=248476708&single=true&output=csv',
			'../generate/janek/',
			'janek.csv'
		);
		if (file === 'Pobrane') {
			const data = await csvtojson()
				.fromFile('../generate/janek/janek.csv')
				.then((json) => {
					return json;
				});
			resolve(data);
		} else {
			reject(file);
		}
	});
};

const processData = async () => {
	const data = await getFile();

	const prods = data.map((item, index) => {
		if (index !== 1) return;
		console.log(
			item['Metafield: custom']['second_description_row ']
				.single_line_text_field
		);

		return {
			ID: item.ID,
			'Body HTML': item['Body HTML'],
			Vendor: item.Vendor,
			'Custom Collections': item['Custom Collections'],
			'Metafield: custom.first_description_row [single_line_text_field]':
				item['Metafield: custom'][
					'first_description_row '
				].single_line_text_field.replace('\r\n', ' '),
			'Metafield: custom.second_description_row [single_line_text_field]':
				item['Metafield: custom'][
					'second_description_row '
				].single_line_text_field.replace('\r\n', ' '),
		};
	});

	const converted = new ObjectsToCsv(prods);
	await converted.toDisk(`../generate/janek/janek-converted.csv`, {
		delimiter: ',',
	});
};

processData();
