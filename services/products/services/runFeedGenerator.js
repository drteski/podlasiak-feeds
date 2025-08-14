import Feeds from '../../../models/Feeds.js';
import { differenceInHours } from 'date-fns';

export const runFeedGenerator = async (name, update = false) => {
	const existingFeed = await Feeds.findOne({ name });
	const now = new Date();

	if (update && existingFeed) {
		await existingFeed.updateOne({ updatedAt: now });
		return true;
	}

	if (!existingFeed) {
		const newFeed = new Feeds({
			name,
			updatedAt: new Date(2021, 0, 1, 0, 0, 0, 0),
		});
		await newFeed.save();
		return true;
	}

	return differenceInHours(now, existingFeed.updatedAt) >= 4;
};
