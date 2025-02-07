import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const CronTime = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

CronTime.plugin(uniqueValidator);
export default mongoose.model('CronTime', CronTime);
