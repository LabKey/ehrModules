/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.lsid,
  b.id,
  b.date,
  b.lastDate,
  b.weight,
  BloodLast30,
  convert(b.weight*0.2*60, NUMERIC) AS MaxBlood,
  convert(((b.weight*0.2*60) - b.BloodLast30), NUMERIC) AS AvailBlood,

from (
SELECT
  b.lsid,
  b.id,
  b.date,
  lastWeight.date as lastDate,
  (
    SELECT AVG(w.weight) AS _expr
    FROM study.weight w
    WHERE w.id=b.id AND w.date=lastWeight.date
  ) AS weight,
  (
    SELECT SUM(draws.quantity) AS _expr
    FROM study.blood draws
    WHERE draws.id=b.id AND
        draws.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, b.date) AND b.date
  ) AS BloodLast30

FROM
    study.blood b LEFT OUTER JOIN
    (SELECT w.id, MAX(date) as date FROM study.weight w GROUP BY w.id) lastWeight ON b.id = lastWeight.id

WHERE b.date >= TIMESTAMPADD('SQL_TSI_DAY', -180, now())

) b