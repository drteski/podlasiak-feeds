import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 1000,
});
const db = mongoose.connection;

db.on('error', (err) => console.log(err));
db.once('open', () => {
	console.log('Połączono z DB');
});
