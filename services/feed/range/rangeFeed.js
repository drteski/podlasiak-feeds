import axios from 'axios';

const SUPLIER_ID = 19701;

const rangeAuth = () => {
	return new Promise(async (resolve, reject) => {
		const cookie = await axios
			.post(
				'https://supplier.rstore.com/rest/authenticate.api',
				{
					user: 'dessy.sajewicz@rea.pl',
					pass: 'Podlas1ak',
				},
				{ withCredentials: true }
			)
			.then((res) => res.headers['set-cookie'].join('').split(';')[0])
			.catch((error) => reject(error));
		resolve(cookie);
	});
};

const connection = async () => {
	const cookie = await axios
		.post(
			'https://supplier.rstore.com/rest/authenticate.api',
			{
				user: 'dessy.sajewicz@rea.pl',
				pass: 'Podlas1ak',
			},
			{ withCredentials: true }
		)
		.then((res) => res.headers['set-cookie'].join('').split(';')[0]);

	await axios
		.post(
			`https://supplier.rstore.com/rest/product_feed.api?supplier_id=${SUPLIER_ID}`,
			{
				product_arr: [
					{
						vendor_sku: '435135384',
						related_product: 'REA-B8978',
						title: 'Bidet faucet Lungo Loop Black',
						brand: 'Rea',
						// gtin: '5902557344826',
						price_arr: [
							{
								price: '88',
								currency: 'GBP',
								effective_from: '2024-11-20',
							},
						],
						product_category: 'Bathroom Sinks',
						description: 'A Shoe Test',
						image_url_arr: ['https://www.therange.co.uk/example1.jpg'],
						fulfilment_class: 'Small',
						active: 1,
						visible: 1,
						launch_date: '2024-11-20',
					},
				],
			},
			{
				headers: { cookie },
			}
		)
		.then((res) => console.log(res.data));
};

rangeAuth().then(connection);
