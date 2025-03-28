import { uploadProducts } from '../services/products/uploadProducts.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { generateFeeds } from './updateFeeds.controller.js';
import cliProgress from 'cli-progress';
import ansiColors from 'ansi-colors';
import { uploadFeeds } from '../services/processFeed.js';

dotenv.config({ path: '../.env' });

mongoose.set('strictQuery', true);

console.log('');
console.log('');
console.log('');
console.log('');
console.log(
	ansiColors.green(
		'                                                _  _              _         _            \n' +
			'                              _ __    ___    __| || |  __ _  ___ (_)  __ _ | | __        \n' +
			"                      _____  | '_ \\  / _ \\  / _` || | / _` |/ __|| | / _` || |/ /  _____ \n" +
			'                     |_____| | |_) || (_) || (_| || || (_| |\\__ \\| || (_| ||   <  |_____|\n' +
			'                             | .__/  \\___/  \\__,_||_| \\__,_||___/|_| \\__,_||_|\\_\\        \n' +
			'                             |_|                                                         '
	)
);
console.log('');
console.log('');
console.log('');
console.log('');

await mongoose.connect(
	process.env.DATABASE_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 0,
		socketTimeoutMS: 0,
		connectTimeoutMS: 0,
		heartbeatFrequencyMS: 2000,
	},
	(error) => {
		if (error) {
			console.log(error);
		}
	}
);
mongoose.connection.on('error', (err) => console.log(err));

const bar = new cliProgress.SingleBar({
	format: `    ${ansiColors.red('{bar}')} {percentage} % • {duration_formatted} •{additionalData} ${ansiColors.red('{dane}')} `,
	barCompleteChar: '\u2588',
	barIncompleteChar: '\u2591',
	barsize: 50,
	hideCursor: true,
});

// while (true) {
// await uploadProducts(bar)
// 	.then(
// 		async () =>
await generateFeeds(bar)
	.then(async () => await uploadFeeds('../generate/feed', bar))
	.catch((error) => console.log(error));
// )
// .catch((error) => console.log(error));
