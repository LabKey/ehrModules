/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (account) AS account, (quantity) AS quantity, (collected_by) AS collected_by, (method) AS method, (glucose) AS glucose, (bilirubin) AS bilirubin, (ketone) AS ketone, (sp_gravity) AS sp_gravity, (blood) AS blood, (ph) AS ph, (protein) AS protein, (urobilinogen) AS urobilinogen, (nitrite) AS nitrite, (leucocytes) AS leucocytes, (appearance) AS appearance, (microscopic) AS microscopic, FixNewlines(clincomment) AS remark, ( CONCAT_WS(', ', 
     CASE WHEN quantity IS NULL  OR quantity=''  THEN NULL ELSE CONCAT('quantity: ', quantity)  END, 
     CASE WHEN collected_by IS NULL  OR collected_by=''  THEN NULL ELSE CONCAT('collected_by: ', collected_by)  END, 
     CASE WHEN method IS NULL  OR method=''  THEN NULL ELSE CONCAT('method: ', method)  END, 
     CASE WHEN glucose IS NULL  OR glucose=''  THEN NULL ELSE CONCAT('glucose: ', glucose)  END, 
     CASE WHEN bilirubin IS NULL  OR bilirubin=''  THEN NULL ELSE CONCAT('bilirubin: ', bilirubin)  END, 
     CASE WHEN ketone IS NULL  OR ketone=''  THEN NULL ELSE CONCAT('ketone: ', ketone)  END, 
     CASE WHEN sp_gravity IS NULL  THEN NULL ELSE CONCAT('sp_gravity: ', CAST(sp_gravity AS CHAR))  END, 
     CASE WHEN blood IS NULL  OR blood=''  THEN NULL ELSE CONCAT('blood: ', blood)  END, 
     CASE WHEN ph IS NULL  THEN NULL ELSE CONCAT('ph: ', CAST(ph AS CHAR))  END, 
     CASE WHEN protein IS NULL  OR protein=''  THEN NULL ELSE CONCAT('protein: ', protein)  END, 
     CASE WHEN urobilinogen IS NULL  OR urobilinogen=''  THEN NULL ELSE CONCAT('urobilinogen: ', urobilinogen)  END, 
     CASE WHEN nitrite IS NULL  OR nitrite=''  THEN NULL ELSE CONCAT('nitrite: ', nitrite)  END, 
     CASE WHEN leucocytes IS NULL  OR leucocytes=''  THEN NULL ELSE CONCAT('leucocytes: ', leucocytes)  END, 
     CASE WHEN appearance IS NULL  OR appearance=''  THEN NULL ELSE CONCAT('appearance: ', appearance)  END, 
     CASE WHEN microscopic IS NULL  OR microscopic=''  THEN NULL ELSE CONCAT('microscopic: ', microscopic)  END
     ) ) AS Description FROM urine
