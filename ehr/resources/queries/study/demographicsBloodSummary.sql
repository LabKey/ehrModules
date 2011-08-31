/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.lsid,
  b.id,
  --b.date,
  b.wdate as MostRecentWeightDate,
  b.weight as MostRecentWeight,
  convert(BloodLast30, NUMERIC) as BloodLast30,
  convert(BloodNext30, NUMERIC) as BloodNext30,
  convert(b.weight*0.2*60, NUMERIC) AS MaxBlood,
  convert(case
    when (b.BloodLast30 > b.BloodNext30)
      THEN ((b.weight*0.2*60) - b.BloodLast30)
    else
      ((b.weight*0.2*60) - b.BloodNext30)
  end, NUMERIC) as AvailBlood
from (
SELECT
  d.lsid,
  d.id,
--   d.weight,
--   d.wdate,
  lastWeight.date as wdate,
  (
    SELECT AVG(w.weight) AS _expr
    FROM study.weight w
    WHERE w.id=d.id AND w.date=lastWeight.date
    AND w.qcstate.publicdata = true
  ) AS weight,
  COALESCE ((
    SELECT
    SUM(bd.quantity) AS _expr
    FROM study."Blood Draws" bd
    WHERE bd.id=d.id AND
        bd.qcstate.publicdata = true AND
        bd.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, now()) AND now()

  ), 0) AS BloodLast30,
  COALESCE ((
    SELECT
    SUM(bd.quantity) AS _expr
    FROM study."Blood Draws" bd
    WHERE bd.id=d.id AND
        (bd.qcstate.publicdata = true OR bd.qcstate.metadata.DraftData = true) AND
        bd.date BETWEEN now() AND TIMESTAMPADD('SQL_TSI_DAY', 30, now())

  ), 0) AS BloodNext30

FROM
    study.demographics d
    LEFT OUTER JOIN
    (SELECT w.id, MAX(date) as date FROM study.weight w
    WHERE w.qcstate.publicdata = true
    GROUP BY w.id) lastWeight ON d.id = lastWeight.id

-- WHERE b.date >= TIMESTAMPADD('SQL_TSI_DAY', -30, now())
WHERE
--d.id.status.status = 'Alive'
d.calculated_status = 'Alive'

) b