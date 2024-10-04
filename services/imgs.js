import downloadHandler from '../utilities/downloadCsv.utility.js';
import fs from 'fs';
import { readdir } from '@babel/cli/lib/babel/util.js';

const files = './datas';

const items = fs.readdirSync(files);

console.log(items);
const regx = /<img[^>]+src="([^">]+)"/gm;

items.forEach((item) => {
	const data = fs.readFileSync(files + '/' + item, 'utf-8');
	console.log([...data.replace(/(\r\n|\n|\r)/gm, '').matchAll(regx)]);
});
