/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.lsid,
  b.id,
  --b.date,
  b.lastDate as MostRecentWeightDate,
  b.weight as MostRecentWeight,
  BloodLast30,
  convert(b.weight*0.2*60, NUMERIC) AS MaxBlood,
  convert(((b.weight*0.2*60) - b.BloodLast30), NUMERIC) AS AvailBlood,

from (
SELECT
  d.lsid,
  d.id,
  lastWeight.date as lastDate,
  (
    SELECT AVG(w.weight) AS _expr
    FROM study.weight w
    WHERE w.id=d.id AND w.date=lastWeight.date
  ) AS weight,
  (
    SELECT
    SUM(bd.quantity) AS _expr
    FROM study.blood bd
    WHERE bd.id=d.id AND
        bd.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, now()) AND now()
  ) AS BloodLast30

FROM
    study.demographics d LEFT OUTER JOIN
    (SELECT w.id, MAX(date) as date FROM study.weight w GROUP BY w.id) lastWeight ON d.id = lastWeight.id

-- WHERE b.date >= TIMESTAMPADD('SQL_TSI_DAY', -30, now())
WHERE d.id.status.status = 'Alive'

) b