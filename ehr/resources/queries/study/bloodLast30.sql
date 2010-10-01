/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

b.lsid,
-- b.id,
-- b.date,
-- b.quantity,
-- timestampadd('SQL_TSI_DAY', -30, b.date) as minDate,
sum(b0.quantity) as BloodLast30,


from study.blood b

--find all blood draws within the past 30 days relative to this record
LEFT JOIN
  study.blood b0
  ON (b0.Id = b.Id AND b.date >= b0.date AND TIMESTAMPDIFF('SQL_TSI_DAY', b0.date, b.date) <= 30 )

WHERE TIMESTAMPDIFF('SQL_TSI_DAY', b.date, now()) <= 180

GROUP BY
b.lsid
-- b.id,
-- b.date,
-- b.quantity

