import ObjectsToCsv from 'objects-to-csv-file';
import PL from '../models/PL.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const generateBasicBLCsv = async () => {
	const products = await PL.find();

	if (products === null) return;
	const productFeed = [];

	products
		.reduce((previousValue, currentValue) => {
			if (
				previousValue.findIndex(
					(prev) => prev.variantId === currentValue.variantId
				) === -1
			) {
				if (currentValue.sku === '') return [...previousValue];
				if (!currentValue.sku) return [...previousValue];
				return [
					{
						price: currentValue.price,
						sku: currentValue.sku
							.toUpperCase()
							.replace(' REZYGNACJA', ''),
					},
					...previousValue,
				];
			}
			return [...previousValue];
		}, [])
		.forEach((product) => {
			const { sku, price } = product;
			productFeed.push({
				sku,
				price,
			});
		});

	const csv = new ObjectsToCsv(productFeed);
	await csv.toDisk(`../generate/feed/basic_bl_pl.csv`, { delimiter: ';' });
	console.log(`basic_bl_pl.csv zapisany.`);
};

export default generateBasicBLCsv;

import mongoose from 'mongoose';
