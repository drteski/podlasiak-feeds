import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Subiekt = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true,
	},
	type: {
		type: String,
	},
	name: {
		type: String,
	},
	group: {
		type: String,
	},
	sku: {
		type: String,
	},
	ean: {
		type: String,
	},
	totalStock: {
		type: Number,
	},
	onHoldStock: {
		type: Number,
	},
	availableStock: {
		type: Number,
	},
	prices: {
		type: {
			lastDelivery: Number,
			youngestDelivery: Number,
			oldestDelivery: Number,
			averageDelivery: Number,
			lastBuy: Number,
			lastPrice: Number,
			nett: Number,
			gross: Number,
		},
	},
	b2b: {
		type: Boolean,
	},
	isStoreSell: {
		type: Boolean,
	},
	isSello: {
		type: Boolean,
	},
	isMobile: {
		type: Boolean,
	},
	description: {
		type: String,
	},
	priceUpdateDate: {
		type: Date,
	},
	updatedAt: {
		type: Date,
		default: () => new Date(),
	},
});

Subiekt.plugin(uniqueValidator);
export default mongoose.model('Subiekt', Subiekt);
