import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Product = new mongoose.Schema({
	uid: {
		type: Number,
		required: true,
		unique: true,
	},
	id: {
		type: String,
	},
	active: { type: Boolean },
	variantId: {
		type: String,
	},
	activeVariant: { type: Boolean },
	sku: {
		type: String,
	},
	ean: {
		type: String,
	},
	weight: {
		type: Number,
	},
	stock: {
		type: Number,
		default: 0,
	},
	producer: {
		type: String,
	},
	aliases: {
		type: [String],
	},
	title: {
		type: [{}],
	},
	description: {
		type: [{}],
	},
	variantName: { type: [{}] },

	basePrice: {
		type: [{}],
	},
	sellPrice: {
		type: [{}],
	},
	images: {
		type: [{}],
	},
	category: { type: [{}] },
	url: {
		type: [{}],
	},
	attributes: {
		type: [{}],
	},
});

Product.plugin(uniqueValidator);
export default mongoose.model('Product', Product);
