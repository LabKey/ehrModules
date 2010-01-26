/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (account) AS account, ( CONCAT_WS(', ', 
     CASE WHEN clinremark IS NULL  OR clinremark=''  THEN NULL ELSE CONCAT('clinremark: ', FixNewlines(clinremark))  END,
     CASE WHEN remark IS NULL  OR remark=''  THEN NULL ELSE CONCAT('remark: ', FixNewlines(remark))  END ,
     CASE WHEN glucose IS NULL  THEN NULL ELSE CONCAT('glucose: ', CAST(glucose AS CHAR))  END, 
     CASE WHEN bun IS NULL  THEN NULL ELSE CONCAT('bun: ', CAST(bun AS CHAR))  END, 
     CASE WHEN creatinine IS NULL  THEN NULL ELSE CONCAT('creatinine: ', CAST(creatinine AS CHAR))  END, 
     CASE WHEN ck_cpk IS NULL  THEN NULL ELSE CONCAT('ck_cpk: ', CAST(ck_cpk AS CHAR))  END, 
     CASE WHEN uricacid IS NULL  THEN NULL ELSE CONCAT('uricacid: ', CAST(uricacid AS CHAR))  END, 
     CASE WHEN cholesterol IS NULL  THEN NULL ELSE CONCAT('cholesterol: ', CAST(cholesterol AS CHAR))  END, 
     CASE WHEN triglyc IS NULL  THEN NULL ELSE CONCAT('triglyc: ', CAST(triglyc AS CHAR))  END, 
     CASE WHEN sgot_ast IS NULL  THEN NULL ELSE CONCAT('sgot_ast: ', CAST(sgot_ast AS CHAR))  END, 
     CASE WHEN ldh IS NULL  THEN NULL ELSE CONCAT('ldh: ', CAST(ldh AS CHAR))  END, 
     CASE WHEN tbili IS NULL  THEN NULL ELSE CONCAT('tbili: ', CAST(tbili AS CHAR))  END, 
     CASE WHEN ggt IS NULL  THEN NULL ELSE CONCAT('ggt: ', CAST(ggt AS CHAR))  END, 
     CASE WHEN sgpt_alt IS NULL  THEN NULL ELSE CONCAT('sgpt_alt: ', CAST(sgpt_alt AS CHAR))  END, 
     CASE WHEN tprotein IS NULL  THEN NULL ELSE CONCAT('tprotein: ', CAST(tprotein AS CHAR))  END, 
     CASE WHEN albumin IS NULL  THEN NULL ELSE CONCAT('albumin: ', CAST(albumin AS CHAR))  END, 
     CASE WHEN phosphatase IS NULL  THEN NULL ELSE CONCAT('phosphatase: ', CAST(phosphatase AS CHAR))  END, 
     CASE WHEN calcium IS NULL  THEN NULL ELSE CONCAT('calcium: ', CAST(calcium AS CHAR))  END, 
     CASE WHEN phosphorus IS NULL  THEN NULL ELSE CONCAT('phosphorus: ', CAST(phosphorus AS CHAR))  END, 
     CASE WHEN iron IS NULL  THEN NULL ELSE CONCAT('iron: ', CAST(iron AS CHAR))  END, 
     CASE WHEN sodium IS NULL  THEN NULL ELSE CONCAT('sodium: ', CAST(sodium AS CHAR))  END, 
     CASE WHEN potassium IS NULL  THEN NULL ELSE CONCAT('potassium: ', CAST(potassium AS CHAR))  END, 
     CASE WHEN chloride IS NULL  THEN NULL ELSE CONCAT('chloride: ', CAST(chloride AS CHAR))  END
     ) ) 
     AS Description, (glucose) AS glucose, (bun) AS bun, (creatinine) AS creatinine, (ck_cpk) AS ck_cpk, (uricacid) AS uricacid, (cholesterol) AS cholesterol, (triglyc) AS triglyc, (sgot_ast) AS sgot_ast, (ldh) AS ldh, (tbili) AS tbili, (ggt) AS ggt, (sgpt_alt) AS sgpt_alt, (tprotein) AS tprotein, (albumin) AS albumin, (phosphatase) AS phosphatase, (calcium) AS calcium, (phosphorus) AS phosphorus, (iron) AS iron, (sodium) AS sodium, (potassium) AS potassium, (chloride) AS chloride, FixNewlines(remark) AS remark, FixNewlines(clinremark) AS clinremark FROM chemistry
     WHERE id != ''
