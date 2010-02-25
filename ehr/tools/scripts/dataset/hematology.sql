/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (account) AS account, (wbc) AS wbc, (rbc) AS rbc, (hgb) AS hgb, (hct) AS hct, (mcv) AS mcv, (mch) AS mch, (mchc) AS mchc, (rdw) AS rdw, (plt) AS plt, (mpv) AS mpv, (pcv) AS pcv, (n) AS n, (l) AS l, (m) AS m, (e) AS e, (b) AS b, (bands) AS bands, (metamyelo) AS metamyelo, (myelo) AS myelo, (tprotein) AS tprotein, (reticulo) AS reticulo, FixNewlines(remark) AS remark, FixNewlines(clinremark) AS clinremark, (proMyelo) AS proMyelo, (blast) AS blast, (atyLymph) AS atyLymph, (other) AS other, 
     ( CONCAT_WS(',\n', 
     CONCAT('WBC: ', CAST(wbc AS CHAR)),
     CONCAT('RBC: ', CAST(rbc AS CHAR)),
     CONCAT('HGB: ', CAST(hgb AS CHAR)),
     CONCAT('HCT: ', CAST(hct AS CHAR)),
     CONCAT('MCV: ', CAST(mcv AS CHAR)),
     CONCAT('MCH: ', CAST(mch AS CHAR)),
     CONCAT('MCHC: ', CAST(mchc AS CHAR)), 
     CONCAT('RDW: ', CAST(rdw AS CHAR)),
     CONCAT('PLT: ', CAST(plt AS CHAR)),
     CONCAT('MPV: ', CAST(mpv AS CHAR)),
     CONCAT('PCV: ', CAST(pcv AS CHAR)),
     CONCAT('N: ', CAST(n AS CHAR)),
     CONCAT('L: ', CAST(l AS CHAR)),
     CONCAT('M: ', CAST(m AS CHAR)),
     CONCAT('E: ', CAST(e AS CHAR)),
     CONCAT('B: ', CAST(b AS CHAR)),
     CONCAT('Bands: ', CAST(bands AS CHAR)),
     CONCAT('Metamyelo: ', CAST(metamyelo AS CHAR)),
     CONCAT('Myelo: ', CAST(myelo AS CHAR)),
     CONCAT('Tprotein: ', CAST(tprotein AS CHAR)),
     CONCAT('Reticulo: ', CAST(reticulo AS CHAR)),
     CONCAT('proMyelo: ', CAST(proMyelo AS CHAR)),
     CONCAT('Blast: ', CAST(blast AS CHAR)),
     CONCAT('AtyLymph: ', CAST(atyLymph AS CHAR)),
     CONCAT('Other: ', CAST(other AS CHAR)),
     CONCAT('Remark: ', FixNewlines(clinremark))
     ) ) AS Description
FROM hematology
