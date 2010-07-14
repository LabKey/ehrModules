/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, (account) AS account, (glucose) AS glucose, (bun) AS bun, (creatinine) AS creatinine, (ck_cpk) AS ck_cpk, (uricacid) AS uricacid, (cholesterol) AS cholesterol, (triglyc) AS triglyc, (sgot_ast) AS sgot_ast, (ldh) AS ldh, (tbili) AS tbili, (ggt) AS ggt, (sgpt_alt) AS sgpt_alt, (tprotein) AS tprotein, (albumin) AS albumin, (phosphatase) AS phosphatase, (calcium) AS calcium, (phosphorus) AS phosphorus, (iron) AS iron, (sodium) AS sodium, (potassium) AS potassium, (chloride) AS chloride, FixNewlines(remark) AS remark, FixNewlines(clinremark) AS clinremark, null as parentid,
uuid as requestId,
     ( CONCAT_WS(',\n',
     CONCAT('Remark: ', FixNewlines(clinremark)),
     CONCAT('Glucose: ', CAST(glucose AS CHAR)),
     CONCAT('Bun: ', CAST(bun AS CHAR)),
     CONCAT('Creatinine: ', CAST(creatinine AS CHAR)),
     CONCAT('Ck_Cpk: ', CAST(ck_cpk AS CHAR)),
     CONCAT('Uric Acid: ', CAST(uricacid AS CHAR)),
     CONCAT('Cholesterol: ', CAST(cholesterol AS CHAR)),
     CONCAT('Triglyc: ', CAST(triglyc AS CHAR)),
     CONCAT('Sgot_ast: ', CAST(sgot_ast AS CHAR)),
     CONCAT('LDH: ', CAST(ldh AS CHAR)),
     CONCAT('Tbili: ', CAST(tbili AS CHAR)),
     CONCAT('GGT: ', CAST(ggt AS CHAR)),
     CONCAT('sgpt_alt: ', CAST(sgpt_alt AS CHAR)),
     CONCAT('Total Protein: ', CAST(tprotein AS CHAR)),
     CONCAT('Albumin: ', CAST(albumin AS CHAR)),
     CONCAT('Phosphatase: ', CAST(phosphatase AS CHAR)),
     CONCAT('Calcium: ', CAST(calcium AS CHAR)),
     CONCAT('Phosphorus: ', CAST(phosphorus AS CHAR)),
     CONCAT('Iron: ', CAST(iron AS CHAR)),
     CONCAT('Sodium: ', CAST(sodium AS CHAR)),
     CONCAT('Potassium: ', CAST(potassium AS CHAR)),
     CONCAT('Chloride: ', CAST(chloride AS CHAR))
     ) ) AS Description, ts, uuid AS objectid
FROM chemistry

/*WHERE ts > ?*/