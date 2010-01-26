/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (account) AS account, (wbc) AS wbc, (rbc) AS rbc, (hgb) AS hgb, (hct) AS hct, (mcv) AS mcv, (mch) AS mch, (mchc) AS mchc, (rdw) AS rdw, (plt) AS plt, (mpv) AS mpv, (pcv) AS pcv, (n) AS n, (l) AS l, (m) AS m, (e) AS e, (b) AS b, (bands) AS bands, (metamyelo) AS metamyelo, (myelo) AS myelo, (tprotein) AS tprotein, (reticulo) AS reticulo, FixNewlines(remark) AS remark, FixNewlines(clinremark) AS clinremark, (proMyelo) AS proMyelo, (blast) AS blast, (atyLymph) AS atyLymph, (other) AS other, ( CONCAT_WS(', ', 
     CASE WHEN wbc IS NULL  THEN NULL ELSE CONCAT('wbc: ', CAST(wbc AS CHAR))  END, 
     CASE WHEN rbc IS NULL  THEN NULL ELSE CONCAT('rbc: ', CAST(rbc AS CHAR))  END, 
     CASE WHEN hgb IS NULL  THEN NULL ELSE CONCAT('hgb: ', CAST(hgb AS CHAR))  END, 
     CASE WHEN hct IS NULL  THEN NULL ELSE CONCAT('hct: ', CAST(hct AS CHAR))  END, 
     CASE WHEN mcv IS NULL  THEN NULL ELSE CONCAT('mcv: ', CAST(mcv AS CHAR))  END, 
     CASE WHEN mch IS NULL  THEN NULL ELSE CONCAT('mch: ', CAST(mch AS CHAR))  END, 
     CASE WHEN mchc IS NULL  THEN NULL ELSE CONCAT('mchc: ', CAST(mchc AS CHAR))  END, 
     CASE WHEN rdw IS NULL  THEN NULL ELSE CONCAT('rdw: ', CAST(rdw AS CHAR))  END, 
     CASE WHEN plt IS NULL  THEN NULL ELSE CONCAT('plt: ', CAST(plt AS CHAR))  END, 
     CASE WHEN mpv IS NULL  THEN NULL ELSE CONCAT('mpv: ', CAST(mpv AS CHAR))  END, 
     CASE WHEN pcv IS NULL  THEN NULL ELSE CONCAT('pcv: ', CAST(pcv AS CHAR))  END, 
     CASE WHEN n IS NULL  THEN NULL ELSE CONCAT('n: ', CAST(n AS CHAR))  END, 
     CASE WHEN l IS NULL  THEN NULL ELSE CONCAT('l: ', CAST(l AS CHAR))  END, 
     CASE WHEN m IS NULL  THEN NULL ELSE CONCAT('m: ', CAST(m AS CHAR))  END, 
     CASE WHEN e IS NULL  THEN NULL ELSE CONCAT('e: ', CAST(e AS CHAR))  END, 
     CASE WHEN b IS NULL  THEN NULL ELSE CONCAT('b: ', CAST(b AS CHAR))  END, 
     CASE WHEN bands IS NULL  THEN NULL ELSE CONCAT('bands: ', CAST(bands AS CHAR))  END, 
     CASE WHEN metamyelo IS NULL  THEN NULL ELSE CONCAT('metamyelo: ', CAST(metamyelo AS CHAR))  END, 
     CASE WHEN myelo IS NULL  THEN NULL ELSE CONCAT('myelo: ', CAST(myelo AS CHAR))  END, 
     CASE WHEN tprotein IS NULL  THEN NULL ELSE CONCAT('tprotein: ', CAST(tprotein AS CHAR))  END, 
     CASE WHEN reticulo IS NULL  THEN NULL ELSE CONCAT('reticulo: ', CAST(reticulo AS CHAR))  END, 
     CASE WHEN remark IS NULL  OR remark=''  THEN NULL ELSE CONCAT('remark: ', FixNewlines(remark))  END, 
     CASE WHEN clinremark IS NULL  OR clinremark=''  THEN NULL ELSE CONCAT('clinremark: ', FixNewlines(clinremark))  END, 
     CASE WHEN proMyelo IS NULL  THEN NULL ELSE CONCAT('proMyelo: ', CAST(proMyelo AS CHAR))  END, 
     CASE WHEN blast IS NULL  THEN NULL ELSE CONCAT('blast: ', CAST(blast AS CHAR))  END, 
     CASE WHEN atyLymph IS NULL  THEN NULL ELSE CONCAT('atyLymph: ', CAST(atyLymph AS CHAR))  END, 
     CASE WHEN other IS NULL  THEN NULL ELSE CONCAT('other: ', CAST(other AS CHAR))  END) ) AS Description FROM hematology
