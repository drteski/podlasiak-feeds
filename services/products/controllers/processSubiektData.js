import sql from 'mssql';
import { subiektIncludedGroups } from '../../../config/config.js';

const sqlConfig = {
	user: 'sa',
	password: '',
	database: 'PODLASIAK',
	server: `192.168.1.2\\insertsql`,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
	options: {
		encrypt: true,
		trustServerCertificate: true,
		requestTimeout: 360000,
	},
};

const getSubiektData = async () => {
	return new Promise((resolve) => {
		(async () => {
			await sql.connect(sqlConfig);
			const queryProducts = await sql.query`SELECT * FROM tw__Towar`;
			const queryProductsPrices = await sql.query`SELECT * FROM tw_Cena`;
			const queryMag = await sql.query`SELECT * FROM sl_Magazyn`;
			const queryStock = await sql.query`SELECT * FROM tw_Stan`;
			const queryProductsGroup = await sql.query`SELECT *  FROM sl_GrupaTw`;
			const queryFeatures = await sql.query`SELECT * FROM tw_CechaTw`;
			const queryDeliveryPrices = await sql.query(`
            SELECT
                Symbol,
                Nazwa,
                Grupa,
                SredniaCenaZIstniejacychDostaw,
                CenaZNajmlodszejDostawy,
                CenaZNajstarszejDostawy,
                OstatniaCenaZakupu,
                CenaZOstatniejDostawy
            FROM (
                     SELECT
                         T.tw_Symbol AS Symbol,
                         T.tw_Nazwa AS Nazwa,
                         grt_Nazwa AS Grupa,

                         (SELECT ROUND(ISNULL(SUM(dbo.fnSub_CenaSeriiOstatnia(a.mr_SeriaId))/NULLIF(COUNT(mr_Id),0),0),2)
                          FROM dok_magruch a
                          WHERE a.mr_TowId = T.tw_Id AND a.mr_Pozostalo > 0 AND a.mr_MagId IS NOT NULL
                         ) AS SredniaCenaZIstniejacychDostaw,

                         (SELECT TOP 1
                         CASE WHEN d.dok_Typ = 3
                         THEN dbo.fnInsMulDiv(ISNULL(b.mw_Cena,0),100.0,(p.ob_VatProc+100.0),2)
                         ELSE ISNULL(b.mw_Cena,0)
                         END
                     FROM dok_MagRuch a
                         JOIN vwDokMagWart b ON a.mr_SeriaId = b.mw_SeriaId
                         JOIN dok_Pozycja p ON a.mr_PozId = p.ob_Id
                         JOIN dok__Dokument d ON ISNULL(p.ob_DokHanId, p.ob_DokMagId) = d.dok_Id
                     WHERE a.mr_TowId = T.tw_Id AND a.mr_Pozostalo > 0 AND a.mr_MagId IS NOT NULL
                     ORDER BY a.mr_data DESC
                 ) AS CenaZNajmlodszejDostawy,

                 (SELECT TOP 1
                      CASE WHEN d.dok_Typ = 3
							THEN dbo.fnInsMulDiv(ISNULL(b.mw_Cena,0),100.0,(p.ob_VatProc+100.0),2)
							ELSE ISNULL(b.mw_Cena,0)
						END
                  FROM dok_MagRuch a
                      JOIN vwDokMagWart b ON a.mr_SeriaId = b.mw_SeriaId
                      JOIN dok_Pozycja p ON a.mr_PozId = p.ob_Id
                      JOIN dok__Dokument d ON ISNULL(p.ob_DokHanId, p.ob_DokMagId) = d.dok_Id
                  WHERE a.mr_TowId = T.tw_Id AND a.mr_Pozostalo > 0 AND a.mr_MagId = 1
                  ORDER BY a.mr_data ASC
                 ) AS CenaZNajstarszejDostawy,
                
                 (SELECT TOP 1
						ISNULL(((a.ob_CenaNetto + ISNULL(b.ob_CenaNetto, 0)) * (a.ob_Ilosc + ISNULL(b.ob_Ilosc, 0))) /
						NULLIF((a.ob_IloscMag + ISNULL(b.ob_IloscMag, 0)), 0), 0)
                  FROM dok_Pozycja a
                           LEFT JOIN dok_Pozycja b ON b.ob_Id = a.ob_DoId
                           JOIN dok__Dokument d ON d.dok_Id = a.ob_DokHanId
                  WHERE d.dok_Typ IN (1, 5) AND a.ob_TowId = T.tw_Id
                  ORDER BY d.dok_DataWyst DESC
                 ) AS OstatniaCenaZakupu,

                 (SELECT TOP 1
                      CASE WHEN d.dok_Typ = 3
							THEN dbo.fnInsMulDiv(ISNULL(b.mw_Cena,0),100.0,(p.ob_VatProc+100.0),2)
							ELSE ISNULL(b.mw_Cena,0)
						END
                  FROM dok_MagRuch a
                      JOIN vwDokMagWart b ON a.mr_SeriaId = b.mw_SeriaId
                      JOIN dok_Pozycja p ON a.mr_PozId = p.ob_Id
                      JOIN dok__Dokument d ON ISNULL(p.ob_DokHanId, p.ob_DokMagId) = d.dok_Id
                  WHERE a.mr_Id = a.mr_SeriaId AND a.mr_TowId = T.tw_Id
                  ORDER BY mr_Data DESC
                 ) AS CenaZOstatniejDostawy

                FROM tw__Towar T
				LEFT JOIN sl_GrupaTw ON T.tw_IdGrupa = grt_Id
                LEFT JOIN (
                SELECT
                tw_Id AS st_TowarId,
                SUM(st_Stan) AS st_Stan,
                SUM(Rezerwacja) AS st_Rezerwacje,
                SUM(Dostepne) AS st_Dostepne
                FROM vwTowar
                GROUP BY tw_Id
                ) vwT ON T.tw_Id = vwT.st_TowarId
                ) AS A
--             ORDER BY T.tw_Id;
		`);

			resolve({
				products: queryProducts.recordset,
				prices: queryProductsPrices.recordset,
				mag: queryMag.recordset,
				stock: queryStock.recordset,
				group: queryProductsGroup.recordset,
				features: queryFeatures.recordset,
				deliveryPrices: queryDeliveryPrices.recordset,
			});
		})();
	});
};

export const processSubiektData = async () => {
	return new Promise((resolve) => {
		(async () => {
			const data = await getSubiektData();

			const mags = data.mag
				.map((mag) => {
					if (mag.mag_Nazwa === 'CH Fasty' || mag.mag_Nazwa === 'EDI' || mag.mag_Nazwa === 'Galeria Topaz') return;
					return {
						id: mag.mag_Id,
						name: mag.mag_Nazwa,
					};
				})
				.filter(Boolean);
			const stock = data.stock
				.map((stock) => {
					const currentMag = mags.filter((mag) => mag.id === stock.st_MagId);
					if (currentMag.length > 0)
						return {
							productId: stock.st_TowId,
							mag: currentMag[0].name,
							totalStock: stock.st_Stan,
							onHoldStock: stock.st_StanRez,
							availableStock: stock.st_Stan - stock.st_StanRez < 0 ? 0 : stock.st_Stan - stock.st_StanRez,
						};
				})
				.filter(Boolean)
				.reduce((previousValue, currentValue) => {
					const previousIndex = previousValue.findIndex((prev) => prev.productId === currentValue.productId);
					if (previousIndex === -1) {
						return [
							...previousValue,
							{
								productId: currentValue.productId,
								totalStock: currentValue.totalStock,
								onHoldStock: currentValue.onHoldStock,
								availableStock: currentValue.availableStock,
							},
						];
					} else {
						previousValue[previousIndex].totalStock = previousValue[previousIndex].totalStock + currentValue.totalStock;
						previousValue[previousIndex].onHoldStock = previousValue[previousIndex].onHoldStock + currentValue.onHoldStock;
						previousValue[previousIndex].availableStock = previousValue[previousIndex].availableStock + currentValue.availableStock;

						return previousValue;
					}
				}, []);

			const prices = data.prices.map((price) => {
				return {
					productId: price.tc_IdTowar,
					nett: price.tc_CenaNetto1,
					gross: price.tc_CenaBrutto1,
				};
			});
			const b2b = data.features.filter((cecha) => parseInt(cecha.cht_IdCecha) === 42);

			const products = data.products
				.map((product) => {
					const group = data.group.filter((group) => group.grt_Id === product.tw_IdGrupa);
					const basicIndex = b2b.findIndex((b) => b.cht_IdTowar === product.tw_Id);
					const stockIndex = stock.findIndex((stock) => stock.productId === product.tw_Id);
					const currentStock = stock[stockIndex];
					const productPrice = prices.filter((price) => price.productId === product.tw_Id);
					const deliveryPrice = data.deliveryPrices.filter((price) => price.Symbol === product.tw_Symbol);
					return {
						id: parseInt(product.tw_Id),
						type: product.tw_Rodzaj === 1 ? 'Towar' : product.tw_Rodzaj === 2 ? 'Usługa' : product.tw_Rodzaj === 8 ? 'Komplet' : 'Opakowanie zwrotne',
						name: product.tw_Nazwa,
						group: group.length === 0 ? '' : group[0].grt_Nazwa,
						sku: product.tw_Symbol,
						ean: product.tw_PKWiU,
						totalStock: parseInt(currentStock.totalStock),
						onHoldStock: parseInt(currentStock.onHoldStock),
						availableStock: parseInt(currentStock.availableStock),
						prices: {
							lastDelivery: !deliveryPrice[0].CenaZOstatniejDostawy ? 0 : parseFloat(deliveryPrice[0].CenaZOstatniejDostawy),
							youngestDelivery: !deliveryPrice[0].CenaZNajmlodszejDostawy ? 0 : parseFloat(deliveryPrice[0].CenaZNajmlodszejDostawy),
							oldestDelivery: !deliveryPrice[0].CenaZNajstarszejDostawy ? 0 : parseFloat(deliveryPrice[0].CenaZNajstarszejDostawy),
							averageDelivery: !deliveryPrice[0].SredniaCenaZIstniejacychDostaw ? 0 : parseFloat(deliveryPrice[0].SredniaCenaZIstniejacychDostaw),
							lastBuy: !deliveryPrice[0].OstatniaCenaZakupu ? 0 : parseFloat(deliveryPrice[0].OstatniaCenaZakupu),
							nett: !productPrice[0].nett ? 0 : parseFloat(productPrice[0].nett),
							gross: !productPrice[0].gross ? 0 : parseFloat(productPrice[0].gross),
						},
						b2b: basicIndex !== -1,
						isStoreSell: product.tw_SklepInternet,
						isSello: product.tw_SerwisAukcyjny,
						isMobile: product.tw_SprzedazMobilna,
						description: product.tw_Opis,
					};
				})
				.filter((product) => product.type !== 'Usługa' || product.type === 'Opakowanie zwrotne')
				.filter((product) => subiektIncludedGroups.some((group) => group === product.group));
			resolve(products);
		})();
	});
};
