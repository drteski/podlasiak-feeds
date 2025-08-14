import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Feeds = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	products: { type: {} },
	updatedAt: {
		type: Date,
		default: () => new Date(),
	},
});

Feeds.plugin(uniqueValidator);
export default mongoose.model('Feeds', Feeds);
