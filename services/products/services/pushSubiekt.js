import Subiekt from '../../../models/Subiekt.js';
import { isToday } from 'date-fns';

const getLastPrice = (firstPrice, secondPrice) => {
	if (firstPrice !== 0) {
		return firstPrice;
	}
	if (firstPrice === 0 && secondPrice !== 0) {
		return secondPrice;
	}
	return null;
};
export const pushSubiekt = async (product) => {
	const { prices } = product;
	const existing = await Subiekt.findOne({
		id: product.id,
	});
	if (isToday(existing?.updatedAt)) return;

	if (existing) {
		const lastPrice = getLastPrice(prices.oldestDelivery, prices.lastDelivery);

		await Subiekt.updateOne(
			{
				id: product.id,
			},
			{
				...product,
				prices: { ...prices, lastPrice: getLastPrice(prices.oldestDelivery, prices.lastDelivery) },
				priceUpdateDate: existing.prices.lastPrice !== lastPrice ? new Date() : existing.priceUpdateDate,
				updatedAt: new Date(),
			}
		);
	} else {
		const newSubiekt = new Subiekt({
			...product,
			prices: { ...prices, lastPrice: getLastPrice(prices.oldestDelivery, prices.lastDelivery) },
			priceUpdateDate: null,
			updatedAt: new Date(),
		});
		await newSubiekt.save();
	}
};
