import { getProducts } from '../../processFeed.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });
mongoose.set('strictQuery', true);
mongoose.connect(
	process.env.DATABASE_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 0,
		socketTimeoutMS: 0,
		connectTimeoutMS: 0,
	},
	(error) => {
		if (error) {
			console.log(error);
		}
	}
);
mongoose.connection.on('error', (err) => console.log(err));

await getProducts();

await mongoose.connection.close();
