/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (lot) AS lot, (dilution) AS dilution, (eye) AS eye, (result1) AS result1, (result2) AS result2, (result3) AS result3, ( CONCAT_WS(', ', 
     CASE WHEN lot IS NULL  OR lot=''  THEN NULL ELSE CONCAT('lot: ', lot)  END, 
     CASE WHEN dilution IS NULL  OR dilution=''  THEN NULL ELSE CONCAT('dilution: ', dilution)  END, 
     CASE WHEN eye IS NULL  OR eye=''  THEN NULL ELSE CONCAT('eye: ', eye)  END, 
     CASE WHEN result1 IS NULL  OR result1=''  THEN NULL ELSE CONCAT('result1: ', result1)  END, 
     CASE WHEN result2 IS NULL  OR result2=''  THEN NULL ELSE CONCAT('result2: ', result2)  END, 
     CASE WHEN result3 IS NULL  OR result3=''  THEN NULL ELSE CONCAT('result3: ', result3)  END) ) AS Description FROM tb
