/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

  d.MostRecentWeightDate,
  d.MostRecentWeight AS MostRecentWeight,

  T3.MinLast30,
  T3.MaxLast30,

  CASE WHEN (abs((d.MostRecentWeight - T3.MinLast30) * 100 / d.MostRecentWeight) > abs((d.MostRecentWeight - T3.MaxLast30) * 100 / d.MostRecentWeight))
  THEN
    Round(((d.MostRecentWeight-T3.MinLast30) * 100 / d.MostRecentWeight), 1)
  ELSE
    Round(((d.MostRecentWeight - T3.MaxLast30) * 100 / d.MostRecentWeight), 1)
  END as MaxChange30,


  T4.MinLast90,
  T4.MaxLast90,

  CASE WHEN (abs((d.MostRecentWeight - T4.MinLast90) * 100 / d.MostRecentWeight) > abs((d.MostRecentWeight - T4.MaxLast90) * 100 / d.MostRecentWeight))
  THEN
    Round(((d.MostRecentWeight - T4.MinLast90) * 100 / d.MostRecentWeight), 1)
  ELSE
    Round(((d.MostRecentWeight - T4.MaxLast90) * 100 / d.MostRecentWeight), 1)
  END as MaxChange90,

  T5.MinLast180,
  T5.MaxLast180,

  CASE WHEN (abs((d.MostRecentWeight - T5.MinLast180) * 100 / d.MostRecentWeight) > abs((d.MostRecentWeight - T5.MaxLast180) * 100 / d.MostRecentWeight))
  THEN
    Round(((d.MostRecentWeight - T5.MinLast180) * 100 / d.MostRecentWeight), 1)
  ELSE
    Round(((d.MostRecentWeight - T5.MaxLast180) * 100 / d.MostRecentWeight), 1)
  END as MaxChange180


FROM study.demographicsMostRecentWeight d


--Find the min/max weight over last 30 days
LEFT OUTER JOIN
  (select T3.Id, max(T3.weight) as MaxLast30, min(T3.weight) as MinLast30 FROM study.weight T3 WHERE T3.qcstate.publicdata = true AND T3.date > (curdate()-30) GROUP BY T3.Id) T3
  ON (T3.Id = d.Id)

--Find the min/max weight over last 90 days
LEFT OUTER JOIN
  (select T4.Id, max(T4.weight) as MaxLast90, min(T4.weight) as MinLast90 FROM study.weight T4 WHERE T4.qcstate.publicdata = true AND T4.date > (curdate()-90) GROUP BY T4.Id) T4
  ON (T4.Id = d.Id)

--Find the min/max weight over last 180 days
LEFT OUTER JOIN
  (select T5.Id, max(T5.weight) as MaxLast180, min(T5.weight) as MinLast180 FROM study.weight T5 WHERE T5.qcstate.publicdata = true AND T5.date > (curdate()-180) GROUP BY T5.Id) T5
  ON (T5.Id = d.Id)

--WHERE
--d.id.status.status = 'Alive'
--d.id.dataset.demographics.calculated_status = 'Alive'