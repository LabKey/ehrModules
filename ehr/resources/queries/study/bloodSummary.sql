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
w2.prevdate,
timestampadd('SQL_TSI_DAY', -30, b.date) as minDate,
w3.date as WeightDate,
w3.weight,
round(w3.weight*0.2*60, 1) AS MaxBlood,
sum(b0.quantity) as BloodLast30,
round((w3.weight*0.2*60) - sum(b0.quantity), 1) AS AvailBlood,
-- TIMESTAMPDIFF('SQL_TSI_DAY', b.date, now()) as time

from study.blood b

--Find the next most recent weight date less than the blood draw date
LEFT JOIN
  (SELECT b.lsid, max(w.date) as prevdate, max(w.modified) as ts
    FROM study.weight w RIGHT JOIN study.blood b
    ON (w.Id = b.Id AND w.date <= b.date)
    --kind of a hack, but this reduces the number of records we try to sort
    WHERE
    TIMESTAMPDIFF('SQL_TSI_DAY', b.date, now()) <= 210 AND
    TIMESTAMPDIFF('SQL_TSI_DAY', w.date, b.date) <= 210
    GROUP BY b.lsid) w2
    ON (b.lsid = w2.lsid)

--add the most recent weight, based on weight date.  include TS so we should get a single record
LEFT JOIN study.weight w3
    ON (b.Id = w3.Id AND w3.date = w2.prevdate and w3.modified = w2.ts
    --and TIMESTAMPDIFF('SQL_TSI_DAY', w3.date, now()) <= 365
    )

--find all blood draws within the past 30 days relative to this record
LEFT JOIN
  study.blood b0
  ON (b0.Id = b.Id AND b.date >= b0.date AND TIMESTAMPDIFF('SQL_TSI_DAY', b0.date, b.date) <= 30 )


WHERE TIMESTAMPDIFF('SQL_TSI_DAY', b.date, now()) <= 180

GROUP BY
b.lsid,
b.id,
b.date,
b.quantity,
w3.date,
w2.prevdate,
w3.weight

