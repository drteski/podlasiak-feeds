import dotenv from 'dotenv';
import getXmlData from '../OLD-BP/createProducts.service.js';
import config from '../config/config.js';

dotenv.config({ path: '../.env' });

const updateProducts = async () => {
	for await (const key of config) {
		const { domain, link, code, country } = key;
		console.log(`Pobieram produkty dla: ${domain} - ${country}`);
		await getXmlData(link, code, domain)
			.then((res) => console.log(res))
			.catch((e) => console.log(e));
	}
};
export default updateProducts;
