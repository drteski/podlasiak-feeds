import {
	addMuToPrice,
	aliasesFilter,
	getStoreUrl,
	saveFeedFileToDisk,
	titleWithVariantName,
} from '../../processFeed.js';

const categories = [
	{
		sku: 'OSW-09481',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09845',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03951',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03954',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03955',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07011',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07014',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07012',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07015',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07013',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07016',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02434',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02435',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06665',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06765',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02436',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07880',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07881',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07883',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06667',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06668',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06669',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07017',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07018',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07019',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08145',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03622',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08760',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09754',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09756',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06689',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05003',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05004',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08435',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08433',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05000',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05001',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05005',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05006',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06664',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08427',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08430',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08428',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08431',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08434',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05002',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08429',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08432',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08755',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08757',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08758',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08761',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00076',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09681',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09612',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04016',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04019',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08557',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08558',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08712',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04004',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08559',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04008',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00073',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00902',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06916',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00903',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04602',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04603',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04604',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04414',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08914',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00262',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00263',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00014',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00597',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00674',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00675',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08886',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08892',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04411',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01642',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40111',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14009',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14010',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14011',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01402',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40006',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40007',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14014',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14015',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14016',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14021',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14022',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04903',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04904',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40115',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14028',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09046',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14029',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40028',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40029',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40030',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40032',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01407',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01408',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40116',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40117',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01409',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40118',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40033',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40034',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40035',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04098',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-40038',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02456',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06583',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00924',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06582',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06581',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06579',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00926',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06350',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00948',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02430',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05665',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05666',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08087',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02466',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02467',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06701',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03098',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07987',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07986',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01252',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05052',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02440',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04777',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02419',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03603',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03604',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06889',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06890',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06678',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09563',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09587',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03244',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05541',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05554',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02404',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00928',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05777',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08639',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06640',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00201',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00055',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-21009',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-21008',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-21010',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03856',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03857',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-65013',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-65014',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-65011',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-65012',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06116',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03952',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03953',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01695',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01067',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01069',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01070',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-14100',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00937',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00938',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00939',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00910',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00911',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00912',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00915',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00916',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00917',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03086',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03500',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07985',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07685',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04032',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03995',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03994',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09178',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09179',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09180',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09181',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09182',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-09183',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03241',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03797',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-01108',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05550',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05556',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08996',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08199',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05638',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-05639',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03209',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06684',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04660',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00095',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03684',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00856',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-03670',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-08480',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06602',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-21012',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04050',
		category: 'Lampki',
	},
	{
		sku: 'OSW-04898',
		category: 'Lampki',
	},
	{
		sku: 'OSW-03269',
		category: 'Lampki',
	},
	{
		sku: 'OSW-03206',
		category: 'Lampki',
	},
	{
		sku: 'OSW-06328',
		category: 'Lampki',
	},
	{
		sku: 'OSW-01042',
		category: 'Lampki',
	},
	{
		sku: 'OSW-09565',
		category: 'Lampki',
	},
	{
		sku: 'OSW-07009',
		category: 'Lampki',
	},
	{
		sku: 'OSW-09566',
		category: 'Lampki',
	},
	{
		sku: 'OSW-04051',
		category: 'Lampki',
	},
	{
		sku: 'OSW-06965',
		category: 'Lampki',
	},
	{
		sku: 'OSW-03207',
		category: 'Lampki',
	},
	{
		sku: 'OSW-03232',
		category: 'Lampki',
	},
	{
		sku: 'OSW-09853',
		category: 'Lampki',
	},
	{
		sku: 'OSW-03204',
		category: 'Lampki',
	},
	{
		sku: 'OSW-04878',
		category: 'Lampki',
	},
	{
		sku: 'OSW-06963',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08621',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08622',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08623',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08624',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08625',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08626',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08627',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08628',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08329',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08629',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08630',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08631',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08634',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08635',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08636',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08637',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08638',
		category: 'Lampki',
	},
	{
		sku: 'OSW-08620',
		category: 'Lampki',
	},
	{
		sku: 'OSW-00060',
		category: 'Lampki',
	},
	{
		sku: 'OSW-02800',
		category: 'Lampki',
	},
	{
		sku: 'OSW-06683',
		category: 'Lampki',
	},
	{
		sku: 'OSW-00401',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-09683',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00071',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00072',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00189',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-04005',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05027',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00550',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-04015',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06821',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06822',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65001',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-64002',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05032',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05099',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05034',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05036',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05038',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05037',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00005',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-01101',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-01100',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06196',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08560',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08561',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00015',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08801',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40099',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08481',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08482',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08483',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08484',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03858',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40093',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08460',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08461',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40094',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40095',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40108',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40008',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00944',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00400',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08467',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08468',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08469',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08470',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08471',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08473',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08474',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08472',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05035',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65003',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65004',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00551',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65005',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65006',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65007',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-65008',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-04559',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00967',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02426',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02427',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08569',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03691',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08463',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08464',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08465',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08466',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-07860',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03997',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05200',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05201',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05202',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05203',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40097',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40098',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05204',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05205',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05206',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05207',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05342',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05343',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05322',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05333',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05209',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05463',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05465',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-07001',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00869',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08884',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-08885',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40090',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40096',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02400',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02401',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02402',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02422',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02421',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06580',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06584',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02405',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00945',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02695',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05655',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05654',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03087',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03088',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02464',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02465',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06096',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-01253',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-01278',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-01270',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03902',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03903',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02441',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02468',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02469',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02442',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02443',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02418',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02444',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02445',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02446',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02447',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02448',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02449',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02420',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00356',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05678',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05104',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05107',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05116',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05120',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02461',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05368',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05941',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05942',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05109',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05113',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05114',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05115',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00057',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00056',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21014',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21004',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21001',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21007',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21013',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21015',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21006',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21003',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21005',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-21000',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00940',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00943',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00918',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00919',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00952',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00953',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00954',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00955',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00956',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00957',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00958',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-063952',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00964',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00966',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-07984',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-07983',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-07686',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-02391',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03900',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05643',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05766',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05765',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-40092',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-04000',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00219',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00139',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00061',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00053',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00360',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-09751',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-09752',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-07902',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06604',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06616',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-06606',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-14008',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-09685',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05641',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05642',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-03200',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-30000',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-05640',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-09671',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00653',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-10001',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-10002',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-10004',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00405',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00683',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00684',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09473',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09472',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00676',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03641',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05026',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04006',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04412',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04409',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04408',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07866',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05555',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00033',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00034',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00035',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-30006',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06330',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06329',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05031',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05033',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08891',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01458',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05023',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05025',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05022',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05024',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04600',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04601',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04007',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05687',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08485',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08486',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05688',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-6500',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00573',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00574',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00575',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00576',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00577',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00016',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00800',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00187',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00002',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06114',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00017',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00018',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08640',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04009',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04010',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04012',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01102',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04013',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00011',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00012',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00013',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08889',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06095',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00786',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00019',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00020',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07864',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07865',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08796',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06613',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00183',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00185',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40110',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14012',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04690',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40113',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01406',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14037',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00857',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08406',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09856',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08196',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03233',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03235',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03236',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03237',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03238',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03239',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03240',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00178',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00181',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00182',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00179',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00180',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05020',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00171',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00173',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00170',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00172',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00153',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00154',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00156',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00117',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00116',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00120',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14017',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00557',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00559',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01554',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00596',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05644',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01103',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04048',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08793',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08794',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08549',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08550',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08551',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08552',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09757',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09759',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06874',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08746',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06875',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06877',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08767',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08768',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08769',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14013',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09758',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08913',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08742',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06876',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-65016',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'osw-00705',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00101',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00131',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08790',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04030',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03998',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03999',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04031',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05039',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05040',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00164',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00163',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00167',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00166',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00169',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00168',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00165',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01104',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01105',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01106',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01107',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03203',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00879',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00877',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00555',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00558',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00906',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03987',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03988',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08402',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08407',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08404',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08564',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08565',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05321',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08566',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03210',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03211',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03212',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04020',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04021',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05501',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04022',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04023',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04024',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04025',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04026',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04027',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04028',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04029',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06661',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06662',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06663',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06881',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06882',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06660',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03208',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06989',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03202',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00900',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05341',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00149',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00151',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00150',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00104',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00106',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00105',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00110',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00107',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00108',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00113',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00112',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08911',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03696',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08910',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08980',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00562',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00563',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00560',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00561',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00564',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00566',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00568',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00570',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00571',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00413',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00414',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05693',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05695',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05697',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05559',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08007',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08008',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00870',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03789',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00598',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00100',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00102',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00697',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08887',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08888',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08890',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00681',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08893',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08894',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08880',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00265',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00267',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00406',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00350',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00351',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00787',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00408',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00409',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00410',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00353',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00354',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00643',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00644',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00645',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08401',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00865',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00864',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00590',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00591',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00905',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00909',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06362',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06395',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08770',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03569',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06674',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06675',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05663',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07005',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01043',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06110',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04033',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00260',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00614',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07007',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07006',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00615',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03242',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03243',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05240',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05241',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05242',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05243',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05244',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05245',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05246',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05247',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00202',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00203',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01553',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00616',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00118',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00007',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00582',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00607',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00608',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00609',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00611',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05130',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07002',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03205',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06690',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00646',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08004',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00894',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00888',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00887',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-65015',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05013',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05014',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00132',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00610',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09883',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09885',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09850',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09663',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01049',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07020',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07021',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07008',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05481',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08149',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05021',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00222',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06900',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00464',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05502',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05503',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09881',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00700',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00708',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00715',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00710',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08400',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05018',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00880',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05459',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05019',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08960',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00552',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00553',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00604',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00904',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07861',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08915',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08916',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00480',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00863',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00862',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08763',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08764',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05011',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05012',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05193',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01044',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03996',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06901',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06902',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06904',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06903',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00901',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08421',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08408',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08409',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08411',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08413',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08414',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08416',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08418',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08420',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08422',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08423',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08424',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08425',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08426',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06685',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04035',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00907',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00612',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00908',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07623',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04014',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04002',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00261',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06614',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06601',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00200',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00216',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00220',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00218',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00780',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09887',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09889',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09890',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09891',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00264',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08160',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00206',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00204',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05015',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05016',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04561',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05685',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05686',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04003',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08001',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06905',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06906',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06907',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06908',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06909',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06910',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06911',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06912',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00352',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08146',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08147',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00148',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00146',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00103',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00890',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00891',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00892',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00893',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06320',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03895',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40100',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00342',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00343',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00344',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00422',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00670',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00329',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00424',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00425',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00427',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00565',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00583',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00586',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00588',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00589',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00592',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00593',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00594',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00595',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03897',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04661',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06672',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06673',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05630',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05633',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05635',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01560',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00650',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00605',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00094',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00097',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06676',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06677',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00198',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00130',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00358',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00133',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00341',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00359',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00340',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00420',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05631',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00606',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08553',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08545',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08547',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05934',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05636',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00135',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00137',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00136',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00138',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00141',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00140',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00126',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00127',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00128',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00129',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08236',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08237',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08198',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06670',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04049',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00599',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00357',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03699',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00134',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00250',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00253',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00252',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03189',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08563',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06603',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00454',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00456',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00457',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00461',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00463',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00465',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04034',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07863',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07901',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07900',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05500',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07862',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08009',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07858',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07857',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00044',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00045',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07859',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00041',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00077',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00085',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06679',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00078',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00086',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06680',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00079',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00087',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06681',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05340',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06682',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07551',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05551',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07550',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07556',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07534',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07535',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09480',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09482',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04542',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05874',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07557',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09474',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07558',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05558',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06112',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05560',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09483',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09484',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01154',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09485',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06981',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06982',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06983',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06986',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00698',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00696',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05561',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04401',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00682',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04404',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04405',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04406',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04407',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01459',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04666',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01460',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01400',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01461',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40101',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40000',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40102',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14000',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40600',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40103',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40001',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40002',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40104',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40003',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40004',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40005',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40107',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40109',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04557',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04558',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01490',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40009',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04691',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04692',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14018',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40112',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14090',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14091',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40010',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40011',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40012',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40013',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40014',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40016',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40017',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40018',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14025',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14026',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14027',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40019',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40024',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40025',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04590',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04909',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14033',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14034',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40026',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40027',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40091',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40036',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14036',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40037',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00923',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01289',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00925',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00949',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00934',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00931',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00932',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00933',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00883',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00868',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08403',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00417',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07022',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06620',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01041',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05418',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05400',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05553',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05552',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08475',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08476',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07555',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07554',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07553',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07552',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02410',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02411',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02412',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00677',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01403',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01404',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01410',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40120',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40121',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02403',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00920',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02460',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00921',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00922',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02423',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02424',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05050',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02425',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08968',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02406',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00946',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02428',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00947',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02407',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02408',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02409',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02429',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02462',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02463',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00935',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02413',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00968',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00936',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00930',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02414',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02415',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02416',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-02417',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05049',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05051',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01045',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01046',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01047',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00453',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00451',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00452',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09680',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09682',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08597',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08570',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09884',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08596',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09684',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00098',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00099',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00188',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05041',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-30004',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09659',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-14001',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07500',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08477',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08479',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-30002',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09581',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07533',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06151',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08882',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04801',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40020',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40022',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-40023',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00678',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00679',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-30003',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-30005',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00874',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00873',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00871',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00867',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08165',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00718',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00719',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03400',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03401',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00223',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00224',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00225',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00226',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00721',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00228',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00724',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00725',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00726',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00229',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00230',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00231',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00232',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00233',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00236',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00237',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08956',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00175',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00648',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00649',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00177',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00404',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03602',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00601',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08405',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-30001',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00402',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00403',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05637',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04662',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03605',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00647',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00345',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09670',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08752',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03796',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08321',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08197',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08193',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04663',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05365',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05366',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08754',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00075',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08748',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08749',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08750',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08751',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09669',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00328',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-09672',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08632',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08633',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03230',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-06200',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08548',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08555',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03231',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08554',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08556',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-03402',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05690',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05470',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04664',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08490',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-08491',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04036',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04037',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04415',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05557',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01233',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04400',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07010',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07004',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00428',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00429',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00109',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-05028',
		category: 'Plafony',
	},
	{
		sku: 'OSW-05030',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06511',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00088',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00089',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06514',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06513',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00090',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00091',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00092',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00093',
		category: 'Plafony',
	},
	{
		sku: 'OSW-07877',
		category: 'Plafony',
	},
	{
		sku: 'OSW-07878',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08970',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08917',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08972',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08957',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08958',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08959',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08973',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08975',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08976',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06887',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06888',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08964',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08966',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06885',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06886',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08961',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08963',
		category: 'Plafony',
	},
	{
		sku: 'OSW-05208',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03985',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03984',
		category: 'Plafony',
	},
	{
		sku: 'OSW-04410',
		category: 'Plafony',
	},
	{
		sku: 'OSW-14019',
		category: 'Plafony',
	},
	{
		sku: 'OSW-14020',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06589',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00941',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00942',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00959',
		category: 'Plafony',
	},
	{
		sku: 'OSW-05849',
		category: 'Plafony',
	},
	{
		sku: 'OSW-00962',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03085',
		category: 'Plafony',
	},
	{
		sku: 'OSW-07982',
		category: 'Plafony',
	},
	{
		sku: 'OSW-08641',
		category: 'Plafony',
	},
	{
		sku: 'OSW-07981',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03986',
		category: 'Plafony',
	},
	{
		sku: 'OSW-01411',
		category: 'Plafony',
	},
	{
		sku: 'OSW-05562',
		category: 'Plafony',
	},
	{
		sku: 'OSW-05060',
		category: 'Plafony',
	},
	{
		sku: 'OSW-05061',
		category: 'Plafony',
	},
	{
		sku: 'OSW-65009',
		category: 'Plafony',
	},
	{
		sku: 'OSW-65010',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06913',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06914',
		category: 'Plafony',
	},
	{
		sku: 'OSW-06915',
		category: 'Plafony',
	},
	{
		sku: 'OSW-40119',
		category: 'Plafony',
	},
	{
		sku: 'OSW-14002',
		category: 'Plafony',
	},
	{
		sku: 'OSW-14005',
		category: 'Plafony',
	},
	{
		sku: 'OSW-14007',
		category: 'Plafony',
	},
	{
		sku: 'OSW-01214',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01511',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05701',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01034',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-03201',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20020',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20011',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20014',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20017',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01006',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01009',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01011',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01029',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01028',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01002',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05700',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05702',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01001',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01019',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01004',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01054',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01016',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20004',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20006',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20008',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05798',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01023',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01025',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01026',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20022',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20027',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01122',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01545',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01546',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01547',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01146',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01031',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05796',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01129',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01033',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20021',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20013',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20015',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20018',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01007',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01145',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05421',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01121',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05696',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20005',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20007',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20010',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05799',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05797',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01130',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01128',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-02222',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01548',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01549',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01024',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01543',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20024',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20026',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01222',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05703',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01119',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01116',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01118',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01018',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01541',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01542',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-03181',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20012',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20016',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20019',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01008',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01200',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01013',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01010',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01015',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01003',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01020',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01005',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20009',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-02221',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01544',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01027',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20023',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-20025',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01115',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-10502',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-10500',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-10501',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01142',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01557',
		category: 'Akcesoria',
	},
	{
		sku: 'OSW-01556',
		category: 'Akcesoria',
	},
	{
		sku: 'OSW-01555',
		category: 'Akcesoria',
	},
	{
		sku: 'OSW-10204',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10206',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10203',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10200',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10201',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10202',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10213',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-10214',
		category: 'Lampy techniczne',
	},
	{
		sku: 'OSW-00037',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00036',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02431',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02437',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02432',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02438',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02433',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-02439',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04591',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-04551',
		category: 'Lampy Sufitowe',
	},
	{
		sku: 'OSW-00950',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00021',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00022',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00006',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00008',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00009',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00010',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-10246',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-10245',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-10244',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-00701',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00702',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00929',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-07989',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-06767',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04554',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04441',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04800',
		category: 'Kinkiety',
	},
	{
		sku: 'OSW-04555',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-01491',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04592',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-52100',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-07988',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-52101',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00023',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00047',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00025',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00058',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00026',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-00027',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-04011',
		category: 'Lampy Wiszące',
	},
	{
		sku: 'OSW-10247',
		category: 'Pozostałe',
	},
	{
		sku: 'OSW-10248',
		category: 'Pozostałe',
	},
	{
		sku: 'OSW-01416',
		category: 'Lampy Stojące',
	},
	{
		sku: 'OSW-05416',
		category: 'Lampy Stojące',
	},
	{
		sku: 'OSW-10242',
		category: 'Plafony',
	},
	{
		sku: 'OSW-10243',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03100',
		category: 'Plafony',
	},
	{
		sku: 'OSW-10240',
		category: 'Plafony',
	},
	{
		sku: 'OSW-10241',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03004',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03003',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03005',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03007',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03006',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03008',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03019',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03018',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03020',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03022',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03021',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03023',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03010',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03009',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03011',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03034',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03033',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03035',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03031',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03030',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03032',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03043',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03042',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03044',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03046',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03045',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03047',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03025',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03024',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03026',
		category: 'Plafony',
	},
	{
		sku: 'OSW-30010',
		category: 'Plafony',
	},
	{
		sku: 'OSW-30011',
		category: 'Plafony',
	},
	{
		sku: 'OSW-30012',
		category: 'Plafony',
	},
	{
		sku: 'OSW-30013',
		category: 'Plafony',
	},
	{
		sku: 'OSW-30014',
		category: 'Plafony',
	},
	{
		sku: 'OSW-30015',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03069',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03070',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03071',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03072',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03073',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03074',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03063',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03064',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03065',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03066',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03067',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03068',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03057',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03058',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03059',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03060',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03061',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03062',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03048',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03049',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03050',
		category: 'Plafony',
	},
	{
		sku: 'OSW-03101',
		category: 'Plafony',
	},
	{
		sku: 'OSW-10239',
		category: 'Akcesoria',
	},
	{
		sku: 'OSW-12004',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-12001',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-12005',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-12002',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-12006',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-12003',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01099',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01012',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01014',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01000',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05800',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05486',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05485',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05785',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05786',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05787',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05757',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05420',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-01117',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05484',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05488',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-05758',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-10503',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-10000',
		category: 'Żarówki',
	},
	{
		sku: 'OSW-10003',
		category: 'Żarówki',
	},
];
const toolightCatalogFeed = async (
	data,
	language,
	{ aliases = ['Rea', 'Tutumi', 'Toolight'] }
) => {
	const products = aliasesFilter(data, aliases)
		.map((product) => {
			const {
				active,
				id,
				activeVariant,
				variantId,
				sku,
				ean,
				weight,
				producer,
				title,
				description,
				variantName,
				url,
				images,
			} = product;

			const storeUrl = getStoreUrl('pl', 'Toolight');

			const catIndex = categories.findIndex((cat) => cat.sku === sku);

			if (sku.toLowerCase().includes('osw-'))
				return {
					id,
					variantId,
					sku,
					ean,
					weight,
					category: categories[catIndex]?.category,
					title: titleWithVariantName(
						title[language],
						variantName[language]
					),
					producer,
					description: description[language],
					url: storeUrl + url[language]['Toolight'],
					images: images
						.map((image) => storeUrl + 'picture/' + image)
						.join(';'),
				};
		})
		.filter(Boolean);
	return { products, language };
};

export const generateToolightCatalogFeed = async (products, config) => {
	return new Promise(async (resolve) => {
		for await (const language of config.languages) {
			await toolightCatalogFeed(products, language, config).then(
				async (data) => {
					await saveFeedFileToDisk(
						data,
						'toolight-catalog',
						'json',
						'../generate/feed/'
					).then(() => resolve());
				}
			);
		}
	});
};
