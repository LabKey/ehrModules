/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

b.lsid,
b.id,
b.date,
b.quantity,
timestampadd('SQL_TSI_DAY', -30, b.date) as minDate,
w3.date as WeightDate,
w3.weight,
round(w3.weight*0.2*60, 1) AS MaxBlood,
round(b0.BloodLast30, 1) as BloodLast30,
round((w3.weight*0.2*60) - b0.BloodLast30, 1) AS AvailBlood,

FROM (

SELECT
  b.lsid,
  sum(T6.quantity) AS BloodLast30,

FROM study.blood b

--we calculate the total blood drawn in the last 30 days before this date
LEFT JOIN
  study.blood T6
  ON (T6.Id = b.Id AND T6.date <= b.date AND TIMESTAMPDIFF('SQL_TSI_DAY', T6.date, b.date) <= 30 )

WHERE b.Date >= (curdate() - 350)

GROUP BY b.lsid

) b0

LEFT JOIN study.blood b
  on (b0.lsid = b.lsid)


--Find the next most recent weight date less than the blood draw date
LEFT JOIN
  (SELECT b.lsid, max(w.date) as prevdate, max(w.modified) as ts
    FROM study.weight w RIGHT JOIN study.blood b ON (w.Id = b.Id AND w.date <= b.date) GROUP BY b.lsid) w2
    ON (b.lsid = w2.lsid)

--use TS so we guarantee a single record
LEFT JOIN study.weight w3
    ON (b.Id = w3.Id AND w3.date = w2.prevdate and w3.modified = w2.ts)

