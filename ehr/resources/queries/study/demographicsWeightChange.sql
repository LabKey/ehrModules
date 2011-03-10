/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

  T1.MostRecentWeightDate,

  T2.weight AS MostRecentWeight,

FROM study.demographics d

--Find the most recent weight date
LEFT OUTER JOIN
  (select T1.Id, max(T1.date) as MostRecentWeightDate FROM study.weight T1 WHERE t1.qcstate.publicdata = true GROUP BY T1.Id) T1
  ON (T1.Id = d.Id)

--TODO: this could introduce multiple rows
--find the most recent weight
LEFT OUTER JOIN study.weight T2
  ON (T1.MostRecentWeightDate = T2.date AND T2.Id = d.Id)
  
--Find the min/max weight over last 30 days
LEFT OUTER JOIN
  (select T3.Id, max(T3.weight) as MaxLast30, min(T3.weight) as MinLast30 FROM study.weight T3 WHERE T3.qcstate.publicdata = true AND T3.date > (curdate()-30) GROUP BY T3.Id) T3
  ON (T3.Id = d.Id)

--Find the min/max weight over last 90 days
LEFT OUTER JOIN
  (select T4.Id, max(T4.weight) as MaxLast90, min(T4.weight) as MinLast90 FROM study.weight T4 WHERE T4.qcstate.publicdata = true AND T4.date > (curdate()-90) GROUP BY T4.Id) T4
  ON (T3.Id = d.Id)

WHERE d.id.status.status = 'Alive'
AND t2.qcstate.publicdata = true