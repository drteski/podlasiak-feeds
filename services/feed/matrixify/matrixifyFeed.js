import dotenv from 'dotenv';
import { aliasesFilter, productsChunker, saveFeedFileToDisk, titleWithVariantName } from '../../processFeed.js';
import { addMuToPrice } from '../../products/utils/addMuToPrice.js';
import slugify from 'slugify';
import { getSubiektProducts } from '../subiekt/subiektFeed.js';
import { imagesUrl } from '../../../utilities/urls.js';
import { doWgrania } from '../../../config/config.js';
import { runFeedGenerator } from '../../products/services/runFeedGenerator.js';

dotenv.config({ path: '../.env' });

const excluded = [
	35387, 35304, 35288, 51204, 51035, 51027, 49512, 49176, 49508, 49506, 49503, 49430, 49140, 49136, 49495, 49418, 49416, 49415, 49489, 49414, 49413, 49412, 49411, 49408, 49479, 49407, 49475, 49474,
	49124, 49405, 51662, 49122, 49404, 49472, 49120, 49117, 49402, 49116, 49113, 49109, 49108, 49107, 49391, 49386, 49010, 49374, 49373, 49372, 49368, 49367, 49365, 49364, 49363, 48878, 49361, 49341,
	49340, 49339, 48435, 48394, 48387, 51583, 51561, 46747, 51480, 48078, 52585, 46745, 46744, 51490, 48074, 48073, 51549, 51488, 51465, 51472, 46468, 46467, 46466, 46465, 46463, 46462, 46461, 46460,
	48051, 46459, 46457, 46454, 46453, 47620, 46341, 46340, 46337, 47412, 46328, 46327, 46280, 45287, 45286, 47313, 45268, 45263, 45332, 51585, 45254, 51519, 51464, 45093, 45292, 45291, 45290, 45091,
	45090, 45089, 45088, 45087, 45086, 44950, 45085, 44949, 45084, 45083, 45082, 45081, 45117, 44942, 44940, 44939, 44938, 44937, 45073, 44936, 44935, 45071, 44934, 45069, 44930, 44929, 44928, 45103,
	44927, 44926, 44921, 44920, 53427, 44919, 45095, 44918, 45094, 44835, 44834, 44832, 44831, 44830, 44903, 44828, 44902, 44898, 44897, 44894, 44893, 44892, 44891, 44890, 44886, 44884, 44882, 44881,
	44880, 44879, 44878, 44877, 44876, 44874, 44873, 44871, 44868, 44867, 44864, 44862, 44858, 44857, 44856, 44855, 44853, 44848, 44847, 44841, 44839, 44837, 51173, 51172, 51009, 51120, 51119, 51117,
	51289, 51116, 50999, 50952, 44836, 44639, 44638, 44585, 51550, 51579, 44436, 44434, 44432, 51540, 44413, 44600, 44411, 44410, 44409, 44408, 44205, 44407, 44204, 44406, 44405, 44404, 44403, 44402,
	44401, 44400, 44399, 44398, 44073, 44397, 44072, 44396, 44071, 44395, 44394, 44059, 44393, 44391, 44390, 44378, 51541, 44013, 44374, 44007, 43725, 43991, 43719, 44346, 44345, 51458, 44206, 51494,
	51505, 43588, 43584, 43583, 43582, 43581, 43537, 43535, 43199, 43533, 43198, 43197, 43532, 43196, 43531, 43194, 43528, 43527, 43525, 43524, 43523, 43522, 43521, 43520, 43182, 43519, 43181, 43180,
	43518, 43517, 43179, 43660, 43177, 43516, 43176, 43515, 43175, 43514, 43174, 43173, 43172, 43512, 43170, 43511, 43169, 43168, 43167, 43166, 43165, 43164, 43163, 43162, 43161, 43160, 43147, 43146,
	43145, 43144, 43143, 43142, 43141, 43140, 43139, 43132, 43131, 43130, 43129, 43029, 43128, 43028, 43297, 43298, 43125, 43027, 43124, 43026, 43123, 43122, 43120, 43025, 43119, 43118, 43117, 43114,
	43111, 43024, 43110, 43108, 43020, 43095, 43080, 43079, 43233, 43078, 43232, 43076, 43075, 43231, 43230, 43074, 43073, 43072, 43201, 43071, 43200, 43054, 43004, 43048, 43045, 43040, 43033, 43030,
	42984, 42477, 42912, 42911, 42757, 42756, 42419, 42750, 42748, 42744, 42414, 42741, 42399, 42731, 42398, 42730, 42396, 42395, 42727, 51568, 42726, 42723, 42722, 42721, 42720, 42299, 42298, 42717,
	42297, 42295, 42294, 42293, 42292, 42287, 42286, 42285, 42283, 42277, 42281, 42280, 42279, 42275, 42179, 41658, 41657, 42178, 41653, 41650, 41068, 41647, 41646, 40966, 41627, 40922, 41623, 40919,
	40909, 40879, 40878, 51081, 50939, 50938, 50936, 51059, 51057, 51056, 50899, 51050, 51049, 51048, 41366, 41918, 41917, 41916, 41915, 41914, 41913, 41313, 40869, 40865, 40862, 41111, 41115, 40856,
	40855, 41096, 41092, 41090, 41088, 40820, 41087, 41086, 41077, 41070, 41069, 40722, 40691, 40680, 40679, 40678, 40380, 40673, 40379, 40378, 40374, 40373, 40372, 40369, 40367, 40365, 40364, 40363,
	40362, 40361, 40022, 40360, 40359, 40020, 40357, 40356, 40355, 39995, 40354, 40353, 40349, 39993, 40347, 39992, 39991, 39990, 39989, 39988, 39987, 39985, 39983, 39982, 39981, 39980, 39979, 39977,
	39976, 39975, 39974, 39973, 39972, 39970, 39969, 39968, 41365, 39966, 39928, 39927, 39926, 39897, 39896, 39743, 39883, 39882, 39741, 39881, 39880, 39740, 39879, 39876, 39394, 39393, 39875, 39392,
	39874, 39873, 39391, 39872, 39871, 39390, 39870, 39869, 39868, 39867, 39866, 39863, 39664, 39862, 39663, 39662, 39661, 39660, 39659, 39855, 39657, 39656, 39655, 39654, 39377, 39653, 39652, 39376,
	39651, 39650, 39648, 39647, 39646, 39645, 39644, 39643, 39642, 39821, 39641, 39820, 39819, 39818, 39372, 39814, 39370, 39364, 39615, 39614, 39613, 39612, 39805, 39611, 39363, 39804, 39803, 39802,
	39801, 39800, 39799, 39593, 39798, 39592, 39797, 39591, 39590, 39588, 39307, 39794, 39793, 39785, 39578, 39575, 39574, 39573, 39557, 39576, 39544, 39543, 39539, 39538, 39537, 39772, 39765, 39764,
	39763, 39761, 39760, 39434, 39759, 39757, 39756, 39755, 39752, 39416, 39749, 39747, 39396, 39746, 39744, 38616, 38615, 37905, 37818, 37817, 37792, 37791, 37790, 37780, 37779, 37778, 37774, 37773,
	37772, 37771, 37770, 37730, 37726, 37724, 37721, 37720, 37719, 37718, 38100, 37717, 37658, 37657, 37656, 37647, 37646, 37645, 37644, 37643, 37642, 37640, 37638, 37636, 37635, 37634, 37633, 37632,
	37631, 37630, 37629, 37628, 37627, 37626, 37624, 37623, 37621, 37619, 37618, 37616, 37615, 37614, 37608, 37185, 37183, 37577, 37575, 37182, 37574, 37573, 37571, 37570, 37178, 37179, 37569, 37164,
	37165, 37153, 37151, 37090, 37089, 37087, 37086, 37042, 37039, 37026, 37017, 37016, 37015, 37014, 37013, 37012, 37007, 36978, 36979, 37423, 37422, 36976, 37420, 36884, 36881, 36880, 36878, 36848,
	36845, 36823, 36822, 36718, 36717, 36716, 36715, 36725, 36697, 36696, 36720, 36691, 36719, 36583, 36582, 50788, 50606, 50609, 50610, 50611, 50616, 50617, 50619, 50620, 50621, 50785, 50784, 50783,
	50506, 50505, 50304, 50297, 50293, 50292, 50289, 50286, 36441, 36440, 36438, 36436, 36434, 36433, 36432, 36428, 36371, 35490, 36370, 36368, 36365, 36356, 36265, 36264, 35392, 35391, 33583, 33560,
	33415, 33413, 33412, 33396, 33355, 33318, 33316, 33315, 33314, 33313, 33298, 33282, 33266, 33265, 33264, 33263, 33262, 33256, 33248, 33247, 33234, 33219, 33218, 33204, 33203, 33216, 33217, 33143,
	33142, 33076, 33075, 33074, 35325, 35324, 34078, 51492, 51486, 32794, 35305, 35314, 35313, 35312, 33825, 33783, 32607, 32606, 32605, 32504, 32455, 32440, 32437, 32419, 32396, 32175, 32112, 32110,
	32109, 32072, 32071, 32050, 32019, 31942, 31941, 31771, 31613, 31612, 39023, 39021, 39019, 39016, 52516, 31528, 31527, 31526, 31518, 31503, 31480, 30514, 31039, 30423, 30422, 30421, 30420, 30419,
	30418, 30417, 30416, 30415, 30402, 30400, 30696, 30565, 30066, 30065, 30074, 30075, 33779, 30062, 33778, 30352, 33777, 33776, 33756, 33755, 33754, 30027, 30016, 30012, 30282, 30280, 33664, 33660,
	33658, 30235, 30234, 30233, 30216, 30214, 30201, 30176, 30156, 30151, 29753, 29752, 29309, 29748, 30133, 29305, 29303, 30108, 30084, 30083, 30082, 30091, 53432, 30068, 30067, 29045, 50285, 50284,
	50283, 50282, 50281, 50280, 50278, 50715, 50262, 50254, 50119, 50118, 50079, 28256, 28242, 28240, 28238, 28236, 28230, 28228, 28226, 28222, 28218, 28216, 26404, 26394, 26298, 26773, 25924, 25922,
	25847, 25659, 25657, 25655, 25653, 25651, 24465, 24463, 24461, 24459, 25397, 24487, 24486, 24425, 24423, 25393, 25391, 33426, 20633, 51603, 51555, 51547, 51534, 51566, 14845, 50078, 50647, 50072,
	50541, 49881, 49880, 49877, 50537, 49876, 49873, 49872, 49870, 49869, 49867, 49866, 49865, 49864, 49863, 50053, 50052, 49759, 49858, 49755, 49754, 49753, 49853, 49752, 49751, 49852, 13853, 7441,
	7439, 7509, 50290, 51014, 50258, 49907, 49275, 49274, 35388, 51380, 51399, 51400, 51391, 51392, 51397, 51398, 51395, 51396, 51393, 51394, 51403, 51405, 51406, 51408, 51409, 51411, 51412, 51414,
	51415, 51418, 51420, 51421, 51436, 51438, 51448, 51457, 51459, 51460, 51479, 51476, 51487, 51485, 51489, 51491, 51493, 51496, 51513, 51509, 51512, 51522, 51535, 51542, 51548, 51551, 51558, 51562,
	51563, 51572, 51580, 51584, 51586, 51594, 51596, 51599, 51602, 51658, 51665, 52142, 52143, 52144, 52145, 52228, 52229, 52230, 52231, 52236, 52237, 52238, 52245, 52250, 52255, 52265, 52267, 52269,
	49850, 52490, 49849, 49747, 49744, 49847, 49743, 49845, 49742, 49844, 49741, 50018, 49739, 49842, 49738, 50017, 49841, 49737, 50016, 49840, 49735, 49839, 50007, 49817, 49813, 49812, 49809, 49807,
	49703, 49806, 49805, 49804, 49698, 49803, 49697, 49802, 49696, 49800, 49799, 49695, 49798, 49694, 49917, 49693, 49692, 49913, 52272, 52273, 52284, 52293, 52296, 52298, 52308, 52309, 52310, 52311,
	52312, 52313, 52314, 52315, 52316, 52317, 52318, 52319, 52320, 52321, 52322, 52323, 52324, 52325, 52329, 52334, 52336, 52339, 52340, 52341, 52344, 52346, 52347, 52348, 52350, 52351, 52355, 52357,
	52358, 52359, 52360, 52361, 52404, 52405, 52410, 52412, 52414, 52415, 52416, 52417, 52422, 52423, 52424, 52425, 52428, 52429, 52431, 52432, 52433, 52434, 52435, 52436, 52437, 52438, 52439, 52440,
	52442, 52444, 52450, 52588, 52589, 52591, 52593, 52594, 52618, 52619, 52629, 52637, 52642, 52649, 52650, 52651, 52653, 52667, 52668, 52672, 52674, 52675, 52676, 52678, 52680, 52684, 52685, 52689,
	52710, 52711, 52713, 52719, 52721, 52723, 52731, 52732, 52733, 52734, 52743, 52744, 52745, 52749, 52750, 52751, 52752, 52753, 52754, 52756, 52758, 52759, 52761, 52762, 52763, 52793, 52794, 52795,
	52796, 52798, 52799, 52801, 52802, 52806, 52807, 52809, 52812, 52813, 52814, 52815, 52817, 52821, 52822, 52825, 52829, 52863, 52867, 52878, 52880, 52889, 52893, 52898, 52912, 52913, 52915, 52916,
	52917, 52918, 52919, 52920, 52921, 52925, 52939, 52940, 52942, 52943, 52949, 52950, 52952, 52953, 52955, 52956, 52958, 52960, 52962, 52963, 52986, 52988, 52989, 53009, 53011, 53017, 53027, 53032,
	53036, 53037, 53039, 53041, 53045, 53049, 53062, 53063, 53064, 53065, 53067, 53068, 53072, 53073, 53077, 53078, 53079, 53080, 53081, 53082, 53083, 53085, 53086, 53087, 53088, 53089, 53090, 53091,
	53092, 53093, 53094, 53095, 53096, 53097, 53099, 53100, 53101, 53104, 53105, 53103, 53108, 53109, 53107, 53112, 53113, 53111, 53116, 53117, 53122, 53126, 53127, 53129, 53132, 53133, 53131, 53136,
	53137, 53135, 53140, 53141, 53139, 53144, 53145, 53143, 53148, 53149, 53147, 53152, 53153, 53151, 53156, 53157, 53155, 53160, 53161, 53162, 53165, 53166, 53164, 53169, 53170, 53168, 53173, 53174,
	53172, 53177, 53178, 53176, 53181, 53182, 53183, 53223, 53224, 53222, 53228, 53229, 53227, 53232, 53233, 53231, 53236, 53237, 53235, 53240, 53241, 53239, 53249, 53254, 53259, 53262, 53341, 53342,
	53344, 53346, 53375, 53376, 53378, 53431, 53519, 53532, 53539, 53540, 53541, 53542, 53627, 53546, 53548, 53550, 53552, 53628, 53629, 53630, 53600, 53632, 53634, 53636, 53638, 53641, 53650, 53654,
	53657, 53658, 53659, 53666, 53671, 53672, 53673, 53674, 53677, 53678, 53679, 53680, 53681, 53682, 53684, 53685, 53688, 53689, 53690, 53691, 53692, 53693, 53694, 53695, 53696, 53697, 53698, 53699,
	53701, 53702, 53703, 53711, 53716, 53719, 53720, 53721, 53722, 53723, 53724, 53726, 53727, 53728, 53729, 53732, 53734, 53737, 53738, 53753, 53754, 53755, 53756, 53757, 53759, 53760, 53762, 53764,
	53766, 53768, 53772, 53773, 53776, 53779, 53780, 53781, 53784, 53787, 53788, 53789, 53797, 53841, 53842, 53843, 53853, 49689, 49790, 49688, 49687, 49686, 53531, 49685, 49908, 49683, 49906, 49681,
	49905, 49680, 49780, 49901, 49679, 49778, 49776, 49774, 49898, 49773, 49772, 49897, 49665, 49653, 49632, 49763, 49631, 49890, 49889, 49760, 49888, 49619, 49618, 49617, 49616, 49882, 49585, 49613,
	49612, 49583, 49611, 49582, 49610, 49581, 49580, 49608, 49606, 49578, 49605, 49604, 49602, 49601, 49598, 49596, 49595, 49594, 49593, 49591, 49590, 49555, 49589, 49549, 49547, 49546, 49545, 49544,
	49538, 49537, 49536, 49535, 49534, 49533, 49532, 49530, 49529, 49446, 49523, 49520, 49519, 49518, 49517, 49516, 49514, 53872, 49709,
];

const subiektProducts = await getSubiektProducts();
const matFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, chunks = 0 }) => {
	const totalProducts = aliasesFilter(data, ['Toolight']);
	const lustra = [
		11480, 11478, 11477, 11475, 11474, 11210, 11158, 11157, 11156, 11155, 11154, 11152, 11150, 11149, 11148, 11147, 11129, 11128, 11127, 11126, 11124, 11117, 11116, 11114, 11110, 11108, 11107,
		11101, 11099, 11049, 10750, 10741, 10738, 10734, 10733, 10729, 10725, 10724, 10686, 10655, 10653, 10556, 10458, 10457, 10455, 10454, 10453, 10346, 10344, 10343, 10007, 10006, 10005, 10004,
		10003, 10001, 10000, 9999, 9998, 9997, 9996, 9995, 9983, 9982, 9979, 9973, 9972, 9971, 9970, 9969, 9965, 9964, 9963, 9962, 9961, 9960, 9959, 9958, 9957, 9863, 8928, 8927, 8919, 8918, 8898,
		8897, 8896, 8317, 8316, 8315, 8313,
	];
	const products = productsChunker(totalProducts, chunks).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const { id, variantId, active, sku, stock, weight, ean, producer, attributes, title, variantName, category, images, sellPrice } = product;
			if (!lustra.includes(id) && !variantId) {
				if (producer !== 'Toolight') return;
			}

			const dynamicStock = () => {
				if (!active) return 0;
				if (stock < minStock) return 0;
				return stock;
			};

			const type = () => {
				if (category[language].length === 0) return '';
				if (category[language][category[language].length - 1].length === undefined) {
					return category[language][category[language].length - 1].name;
				} else {
					if (category[language][category[language].length - 1].length === 0) return '';
					return category[language][category[language].length - 1].map((cat) => cat.name).join(' > ');
				}
			};

			if (type() === '') return;

			if (dynamicStock() === 0) return;

			chunk.push({
				// 'Handle': sku,
				'Handle': slugify(titleWithVariantName(title[language], variantName[language]).toLowerCase()),
				'Command': 'NEW',
				'Status': 'Active',
				'Vendor': producer,
				'Title': titleWithVariantName(title[language], variantName[language])
					.split(' ')
					.filter((item) => item !== '')
					.map((item) => item[0].toUpperCase() + item.slice(1, item.length))
					.join(' '),
				'Type': type().replace('Kategorie REA > ', '').replace('Kategorie Tutumi > ', ''),
				'Tags': '',
				'Option1 Name': 'Title',
				'Option1 Value': '',
				'Variant SKU': sku,
				'Variant Grams': parseFloat(weight) * 1000,
				'Variant Inventory Tracker': 'shopify',
				'Variant Inventory Qty': dynamicStock(),
				'Variant Inventory Policy': 'deny',
				'Variant Fulfillment Service': 'manual',
				'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Requires Shipping': 'TRUE',
				'Variant Taxable': 'TRUE',
				'Variant Barcode': ean,
				'Variant Weight Unit': 'kg',
				'Image Src': imagesUrl(images, language, aliases, 'default')[0],
				'Image Command': 'MERGE',
				'Image Position': 1,
				'Image Alt Text': titleWithVariantName(title[language], variantName[language]) + ' 1',
				'SEO Title': '',
				'SEO Description': '',
				'Metafield: custom.product_details [single_line_text_field]':
					attributes[language].length === undefined
						? `<ul style="list-style: none; padding: 0;">${[attributes[language]]
								.map((attribute) => {
									if (attribute.name === 'Informacja o dostawie') return;
									return `<li style="list-style: none;"><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`
						: `<ul style="list-style: none; padding: 0;">${attributes[language]
								.map((attribute) => {
									if (attribute.name === 'Informacja o dostawie') return;
									return `<li style="list-style: none;"><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`,
				'Metafield: custom.second_image [single_line_text_field]':
					imagesUrl(images, language, aliases, 'default')[1] === undefined
						? ''
						: `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${imagesUrl(images, language, aliases, 'default')[1]}" alt="">`,
				'Metafield: custom.third_image [single_line_text_field]':
					imagesUrl(images, language, aliases, 'default')[2] === undefined
						? ''
						: `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${imagesUrl(images, language, aliases, 'default')[2]} " alt="">`,
			});
			imagesUrl(images, language, aliases, 'default').forEach((image, index) => {
				if (index === 0) return;
				chunk.push({
					// 'Handle': sku,
					'Handle': slugify(titleWithVariantName(title[language], variantName[language]).toLowerCase()),
					'Command': '',
					'Status': '',
					'Vendor': '',
					'Title': '',
					'Type': '',
					'Tags': '',
					'Option1 Name': '',
					'Option1 Value': '',
					'Variant SKU': '',
					'Variant Grams': '',
					'Variant Inventory Tracker': '',
					'Variant Inventory Qty': '',
					'Variant Inventory Policy': '',
					'Variant Fulfillment Service': '',
					'Variant Price': '',
					'Variant Compare At Price': '',
					'Variant Requires Shipping': '',
					'Variant Taxable': '',
					'Variant Barcode': '',
					'Variant Weight Unit': '',
					'Image Src': image,
					'Image Command': 'MERGE',
					'Image Position': index + 1,
					'Image Alt Text': titleWithVariantName(title[language], variantName[language]) + ' ' + (index + 1),
					'SEO Title': '',
					'SEO Description': '',
					'Metafield: custom.product_details [single_line_text_field]': '',
					'Metafield: custom.second_image [single_line_text_field]': '',
					'Metafield: custom.third_image [single_line_text_field]': '',
				});
			});
		});
		return chunk;
	});

	return { products, language };
};

const matrixifyFeed = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, chunks = 0 }) => {
	const totalProducts = aliasesFilter(data, language === 'ro' ? ['Rea', 'Toolight'] : language === 'hu' ? ['Rea'] : aliases);

	const products = productsChunker(totalProducts, chunks).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const { active, activeVariant, variantId, title, description, sku, stock, weight, ean, producer, attributes, variantName, category, images, sellPrice } = product;
			if (variantId === '') return;
			if (activeProducts) {
				if (!active) return;
			}

			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (language !== 'ro') {
				if (excluded.some((item) => item === parseInt(variantId))) return;
			}

			if (language !== 'ro') {
				if (producer !== 'Rea') return;
			}

			if (producer === 'Tutumi' || producer === 'Quadron' || producer === 'Bluegarden' || producer === 'Flexifit') return;

			const titleWithVariantName =
				title[language] +
				' ' +
				variantName[language]
					.replace('Drzwi:', '')
					.replace('Tür: ', '')
					.replace('Duschwand: ', '')
					.replace('Wand:', 'x')
					.replace('0 Tür: ', '0 x ')
					.replace(' Ścianka: ', 'x')
					.replace(' Drzwi: ', 'x')
					.replace(' x Ścianka:', 'x')
					.replace('Drzwi', '')
					.replace(':x', 'x')
					.replace('x1', ' x 1')
					.replace('---', '');

			const dynamicStock = () => {
				if (!active) return 0;
				if (stock < minStock) return 0;
				return stock;
			};

			const type = () => {
				if (category[language].length === 0) return '';
				if (category[language][category[language].length - 1].length === undefined) {
					return category[language][category[language].length - 1].name;
				} else {
					if (category[language][category[language].length - 1].length === 0) return '';
					return category[language][category[language].length - 1].map((cat) => cat.name).join(' > ');
				}
			};

			if (type() === '') return;

			if (dynamicStock() === 0) return;

			chunk.push({
				'Handle':
					language === 'ro' || language === 'fr' || language === 'hu'
						? slugify(
								titleWithVariantName
									.split(' ')
									.filter((item) => item !== '')
									.map((item) => item[0].toUpperCase() + item.slice(1, item.length))
									.join(' ')
									.toLowerCase()
							)
						: sku,
				'Command': 'NEW',
				'Status': 'Active',
				'Vendor': producer,
				'Title': titleWithVariantName
					.split(' ')
					.filter((item) => item !== '')
					.map((item) => item[0].toUpperCase() + item.slice(1, item.length))
					.join(' '),
				'Type': type().replace('Kategorie REA > ', '').replace('Kategorie Tutumi > ', ''),
				'Tags': '',
				'Option1 Name': 'Title',
				'Option1 Value': '',
				'Variant SKU': sku,
				'Variant Grams': parseFloat(weight) * 1000,
				'Variant Inventory Tracker': 'shopify',
				'Variant Inventory Qty': dynamicStock(),
				'Variant Inventory Policy': 'deny',
				'Variant Fulfillment Service': 'manual',
				'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Requires Shipping': 'TRUE',
				'Variant Taxable': 'TRUE',
				'Variant Barcode': ean,
				'Variant Weight Unit': 'kg',
				'Image Src': imagesUrl(images, language, aliases, 'default')[0],
				'Image Command': 'MERGE',
				'Image Position': 1,
				'Image Alt Text': titleWithVariantName + ' 1',
				'SEO Title': '',
				'SEO Description': '',
				'Metafield: custom.product_details [single_line_text_field]':
					attributes[language].length === undefined
						? `<ul style="list-style: none; ${language === 'ro' ? '' : 'margin: 0 -10px'}; padding: 0;">${[attributes[language]]
								.map((attribute) => {
									if (attribute.name === 'zusätzliche Beschreibung' || attribute.name === 'Informații de livrare') return;
									return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`
						: `<ul style="list-style: none; ${language === 'ro' ? '' : 'margin: 0 -10px'}; padding: 0;">${attributes[language]
								.map((attribute) => {
									if (attribute.name === 'zusätzliche Beschreibung' || attribute.name === 'Informații de livrare') return;
									return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`,
				'Metafield: custom.second_image [single_line_text_field]':
					imagesUrl(images, language, aliases, 'default')[1] === undefined
						? ''
						: `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${imagesUrl(images, language, aliases, 'default')[1]}" alt="">`,
				'Metafield: custom.third_image [single_line_text_field]':
					imagesUrl(images, language, aliases, 'default')[2] === undefined
						? ''
						: `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${imagesUrl(images, language, aliases, 'default')[2]} " alt="">`,
			});
			imagesUrl(images, language, aliases, 'default').forEach((image, index) => {
				if (index === 0) return;
				chunk.push({
					'Handle':
						language === 'ro' || language === 'fr' || language === 'hu'
							? slugify(
									titleWithVariantName
										.split(' ')
										.filter((item) => item !== '')
										.map((item) => item[0].toUpperCase() + item.slice(1, item.length))
										.join(' ')
										.toLowerCase()
								)
							: sku,
					'Command': '',
					'Status': '',
					'Vendor': '',
					'Title': '',
					'Type': '',
					'Tags': '',
					'Option1 Name': '',
					'Option1 Value': '',
					'Variant SKU': '',
					'Variant Grams': '',
					'Variant Inventory Tracker': '',
					'Variant Inventory Qty': '',
					'Variant Inventory Policy': '',
					'Variant Fulfillment Service': '',
					'Variant Price': '',
					'Variant Compare At Price': '',
					'Variant Requires Shipping': '',
					'Variant Taxable': '',
					'Variant Barcode': '',
					'Variant Weight Unit': '',
					'Image Src': image,
					'Image Command': 'MERGE',
					'Image Position': index + 1,
					'Image Alt Text': titleWithVariantName + ' ' + (index + 1),
					'SEO Title': '',
					'SEO Description': '',
					'Metafield: custom.product_details [single_line_text_field]': '',
					'Metafield: custom.second_image [single_line_text_field]': '',
					'Metafield: custom.third_image [single_line_text_field]': '',
				});
			});
		});
		return chunk;
	});

	return { products, language };
};
const matrixifyFeedOld = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], activeProducts = true, activeVariants = true, minStock, chunks = 0 }) => {
	const totalProducts = aliasesFilter(data, language === 'ro' ? ['Rea', 'Toolight'] : language === 'pl' ? ['Toolight'] : aliases);

	const products = productsChunker(totalProducts, chunks).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const { active, activeVariant, variantId, title, sku, stock, weight, ean, producer, attributes, variantName, category, images, sellPrice } = product;

			if (variantId === '') return;

			if (activeProducts) {
				if (!active) return;
			}

			if (activeVariants) {
				if (!activeVariant) return;
			}
			if (language !== 'ro') {
				if (excluded.some((item) => item === parseInt(variantId))) return;
			}

			if (language !== 'ro') {
				if (producer !== 'Rea') return;
			}

			if (producer === 'Tutumi' || producer === 'Quadron' || producer === 'Bluegarden' || producer === 'Flexifit') return;

			const titleWithVariantName =
				title[language] +
				' ' +
				variantName[language]
					.replace('Drzwi:', '')
					.replace('Tür: ', '')
					.replace('Duschwand: ', '')
					.replace('Wand:', 'x')
					.replace('0 Tür: ', '0 x ')
					.replace(' Ścianka: ', 'x')
					.replace(' Drzwi: ', 'x')
					.replace(' x Ścianka:', 'x')
					.replace('Drzwi', '')
					.replace(':x', 'x')
					.replace('x1', ' x 1')
					.replace('---', '');

			const dynamicStock = () => {
				if (!active) return 0;
				if (stock < minStock) return 0;
				return stock;
			};

			const type = () => {
				if (category[language].length === 0) return '';
				if (category[language][category[language].length - 1].length === undefined) {
					return category[language][category[language].length - 1].name;
				} else {
					if (category[language][category[language].length - 1].length === 0) return '';
					return category[language][category[language].length - 1].map((cat) => cat.name).join(' > ');
				}
			};

			if (type() === '') return;

			if (dynamicStock() === 0) return;

			chunk.push({
				'Handle': variantId,
				'Command': 'NEW',
				'Status': 'Active',
				'Vendor': producer,
				'Title': titleWithVariantName
					.split(' ')
					.filter((item) => item !== '')
					.map((item) => item[0].toUpperCase() + item.slice(1, item.length))
					.join(' '),
				'Type': type().replace('Kategorie REA > ', '').replace('Kategorie Tutumi > ', ''),
				'Tags': '',
				'Option1 Name': 'Title',
				'Option1 Value': '',
				'Variant SKU': sku,
				'Variant Grams': parseFloat(weight) * 1000,
				'Variant Inventory Tracker': 'shopify',
				'Variant Inventory Qty': dynamicStock(),
				'Variant Inventory Policy': 'deny',
				'Variant Fulfillment Service': 'manual',
				'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
				'Variant Requires Shipping': 'TRUE',
				'Variant Taxable': 'TRUE',
				'Variant Barcode': ean,
				'Variant Weight Unit': 'kg',
				'Image Src': imagesUrl(images, language, aliases, 'default')[0],
				'Image Command': 'MERGE',
				'Image Position': 1,
				'Image Alt Text': titleWithVariantName + ' 1',
				'SEO Title': '',
				'SEO Description': '',
				'Metafield: custom.product_details [single_line_text_field]':
					attributes[language].length === undefined
						? `<ul style="list-style: none; ${language === 'ro' ? '' : 'margin: 0 -10px'}; padding: 0;">${[attributes[language]]
								.map((attribute) => {
									if (attribute.name === 'zusätzliche Beschreibung' || attribute.name === 'Informații de livrare') return;
									return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`
						: `<ul style="list-style: none; ${language === 'ro' ? '' : 'margin: 0 -10px'}; padding: 0;">${attributes[language]
								.map((attribute) => {
									if (attribute.name === 'zusätzliche Beschreibung' || attribute.name === 'Informații de livrare') return;
									return `<li><strong>${attribute.name}:</strong> ${attribute.value}</li>`;
								})
								.filter(Boolean)
								.join('')}</ul>`,
				'Metafield: custom.second_image [single_line_text_field]':
					imagesUrl(images, language, aliases, 'default')[1] === undefined
						? ''
						: `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${imagesUrl(images, language, aliases, 'default')[1]}" alt="">`,
				'Metafield: custom.third_image [single_line_text_field]':
					imagesUrl(images, language, aliases, 'default')[2] === undefined
						? ''
						: `<img style="height: 360px; width: auto; object-fit: contain; object-position: center;" src="${imagesUrl(images, language, aliases, 'default')[2]} " alt="">`,
			});
			imagesUrl(images, language, aliases, 'default').forEach((image, index) => {
				if (index === 0) return;
				chunk.push({
					'Handle': variantId,
					'Command': '',
					'Status': '',
					'Vendor': '',
					'Title': '',
					'Type': '',
					'Tags': '',
					'Option1 Name': '',
					'Option1 Value': '',
					'Variant SKU': '',
					'Variant Grams': '',
					'Variant Inventory Tracker': '',
					'Variant Inventory Qty': '',
					'Variant Inventory Policy': '',
					'Variant Fulfillment Service': '',
					'Variant Price': '',
					'Variant Compare At Price': '',
					'Variant Requires Shipping': '',
					'Variant Taxable': '',
					'Variant Barcode': '',
					'Variant Weight Unit': '',
					'Image Src': image,
					'Image Command': 'MERGE',
					'Image Position': index + 1,
					'Image Alt Text': titleWithVariantName + ' ' + (index + 1),
					'SEO Title': '',
					'SEO Description': '',
					'Metafield: custom.product_details [single_line_text_field]': '',
					'Metafield: custom.second_image [single_line_text_field]': '',
					'Metafield: custom.third_image [single_line_text_field]': '',
				});
			});
		});
		return chunk;
	});

	return { products, language };
};
const matrixifyFeedStockUpdate = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], minStock, chunks = 0 }) => {
	const products = productsChunker(
		data.filter((product) => product.variantId !== ''),
		chunks
	).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const { sku, variantId, stock, sellPrice, variantName, title } = product;
			// if (language !== 'ro') {
			// 	if (excluded.some((item) => item === parseInt(variantId))) return;
			// }

			const subiektProduct = subiektProducts.filter((sub) => sub.SKU.toLowerCase() === sku.toLowerCase());

			const correctStock = () => {
				if (subiektProduct.length === 0) return stock < minStock ? 0 : stock;
				return parseInt(subiektProduct[0]['Dostępne']) < minStock ? 0 : parseInt(subiektProduct[0]['Dostępne']);
			};

			const titleWithVariantName =
				title[language] +
				' ' +
				variantName[language]
					.replace('Drzwi:', '')
					.replace('Tür: ', '')
					.replace('Duschwand: ', '')
					.replace('Wand:', 'x')
					.replace('0 Tür: ', '0 x ')
					.replace(' Ścianka: ', 'x')
					.replace(' Drzwi: ', 'x')
					.replace(' x Ścianka:', 'x')
					.replace('Drzwi', '')
					.replace(':x', 'x')
					.replace('x1', ' x 1')
					.replace('---', '');

			chunk.push({
				// Handle:
				// 	language === 'ro' || language === 'fr'
				// 		? slugify(
				// 				titleWithVariantName
				// 					.split(' ')
				// 					.filter((item) => item !== '')
				// 					.map(
				// 						(item) =>
				// 							item[0].toUpperCase() +
				// 							item.slice(1, item.length)
				// 					)
				// 					.join(' ')
				// 					.toLowerCase()
				// 			)
				// 		: sku,
				'Variant SKU': sku,
				'Command': 'UPDATE',
				'Status': 'Active',
				'Published': 'TRUE',
				'Published Scope': 'global',
				'Variant Inventory Qty': correctStock(),
				// 'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				// 'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
			});
		});
		return chunk;
	});

	return { products, language };
};
const matrixifyFeedStockUpdateOld = async (data, language, { mu = 0, aliases = ['Rea', 'Tutumi', 'Toolight'], minStock, chunks = 0 }) => {
	const products = productsChunker(
		data.filter((product) => product.variantId !== ''),
		chunks
	).map((prods) => {
		const chunk = [];
		prods.forEach((product) => {
			const { sku, variantId, stock, sellPrice } = product;
			// if (language !== 'ro') {
			// 	if (excluded.some((item) => item === parseInt(variantId))) return;
			// }

			const subiektProduct = subiektProducts.filter((sub) => sub.SKU.toLowerCase() === sku.toLowerCase());

			const correctStock = () => {
				if (subiektProduct.length === 0) return stock < minStock ? 0 : stock;
				return parseInt(subiektProduct[0]['Dostępne']) < minStock ? 0 : parseInt(subiektProduct[0]['Dostępne']);
			};
			chunk.push({
				// Handle: variantId,
				'Variant SKU': sku,
				'Command': 'UPDATE',
				'Status': 'Active',
				'Published': 'TRUE',
				'Published Scope': 'global',
				'Variant Inventory Qty': correctStock(),
				// 'Variant Price': addMuToPrice(sellPrice[language].price, mu),
				// 'Variant Compare At Price': addMuToPrice(sellPrice[language].price, mu),
			});
		});
		return chunk;
	});

	return { products, language };
};

export const generateMatrixifyFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		const shouldRun = await runFeedGenerator(config.name);
		if (!shouldRun) return resolve();
		for await (const language of config.languages) {
			await matFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'lampy_matrixify', 'csv', '../generate/feed/', ',', true);
			});
			await matrixifyFeed(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'matrixify', 'csv', '../generate/feed/', ',', true);
			});
			await matrixifyFeedOld(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'matrixify_old', 'csv', '../generate/feed/', ',', true);
			});
			await matrixifyFeedStockUpdate(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'matrixify_update', 'csv', '../generate/feed/', ',', true);
			});
			await matrixifyFeedStockUpdateOld(products, language, config).then(async (data) => {
				await saveFeedFileToDisk(data, 'matrixify_update_old', 'csv', '../generate/feed/', ',', true);
			});
		}
		await runFeedGenerator(config.name, true);
		resolve();
	});
};
