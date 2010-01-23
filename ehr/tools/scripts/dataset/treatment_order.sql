/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (pno) AS pno, (code) AS code, (meaning) AS meaning, (volume) AS volume, (vunits) AS vunits, (conc) AS conc, (cunits) AS cunits, (amount) AS amount, (units) AS units, (route) AS route, FixDate(enddate) AS enddate, (frequency) AS frequency, (remark) AS remark, (userid) AS userid, 
(concat_ws(' ', amount, coalesce(units, vunits, cunits), meaning,  route, frequency, 'end date: ', enddate)) AS Description FROM treatments
