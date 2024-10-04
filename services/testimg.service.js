import fs from 'fs';
import dotenv from 'dotenv';
import builder from 'xmlbuilder2';
import fruugoCategories from '../data/frugoCategories.js';
import EN from '../models/EN.js';
import mongoose from 'mongoose';
import ObjectsToCsv from 'objects-to-csv-file';
import probe from 'probe-image-size';
import cliProgress from 'cli-progress';
import ansiColors from 'ansi-colors';
import path from 'path';

dotenv.config({ path: '../.env' });

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 10000,
});
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => {
	console.log('Połączono z DB');
});

// const csv = new ObjectsToCsv(mediaData());
// await csv.toDisk(`../generate/feed/test_img.csv`, {
// 	delimiter: ';',
// });
// console.log(`test_img.csv zapisany.`);
//

const prepareData = new Promise(async (resolve, reject) => {
	const products = await EN.find();
	const data = products.map((product) => {
		const { variantId, media } = product;
		return media.map((img) => ({ variantId, url: img.url }));
	});
	resolve(data.flat());
});

const fetchImgInfo = (data) => {
	const bar1 = new cliProgress.SingleBar({
		format:
			'Pobieranie: | ' +
			ansiColors.red('{bar}') +
			' | {percentage}%  ||  {value}/{total}',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true,
	});
	return new Promise(async (resolve, reject) => {
		bar1.start(data.length, 0);
		const imageData = [];
		for (let i = 0; data.length > i; i++) {
			await probe(data[i].url)
				.then((res) =>
					imageData.push({
						variantId: data[i].variantId,
						error: false,
						width: res.width,
						height: res.height,
						type: res.type,
						url: res.url,
						errorMessage: '',
					})
				)
				.catch((e) => {
					imageData.push({
						variantId: data[i].variantId,
						error: true,
						width: '',
						height: '',
						type: '',
						url: '',
						errorMessage: `${e}`,
					});
				});
			bar1.increment();
			bar1.update(i + 1);
		}
		resolve(imageData);
		bar1.stop();
		console.log('pobrano');
	});
};

const saveToCsv = (data) => {
	return new Promise(async (resolve, reject) => {
		const csv = new ObjectsToCsv(data);
		await csv.toDisk(`../generate/feed/test_img.csv`, {
			delimiter: ';',
		});
		resolve(`test_img.csv zapisany.`);
	});
};

const getMediaInfo = async () => {
	await prepareData.then((res) =>
		fetchImgInfo(res).then((dat) =>
			saveToCsv(dat).then((info) => console.log(info))
		)
	);
};

// getMediaInfo();
