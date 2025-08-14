import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cliProgress from 'cli-progress';
import ansiColors from 'ansi-colors';

dotenv.config({ path: '../.env' });

mongoose.set('strictQuery', true);

(async () => {
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
	mongoose.connection.on('connected', () => {
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
	});
	mongoose.connection.on('error', (err) => console.log(err));

	const bar = new cliProgress.SingleBar({
		clearOnComplete: true,
		format: `    ${ansiColors.red('{bar}')} {percentage} % • {duration_formatted} •{additionalData} ${ansiColors.red('{dane}')} `,
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		barsize: 50,
		hideCursor: true,
	});
	const { uploadSubiekt } = await import('../services/products/uploadSubiekt.js');
	await uploadSubiekt(bar);
	const { uploadProducts } = await import('../services/products/uploadProducts.js');
	await uploadProducts(bar);

	const { generateFeeds } = await import('./updateFeeds.controller.js');
	const { uploadFeeds } = await import('../services/processFeed.js');

	await generateFeeds(bar)
		.then(async () => await uploadFeeds('../generate/feed', bar))
		.catch((error) => console.log(error));
	await mongoose.connection.close();
	bar.stop();
})();
