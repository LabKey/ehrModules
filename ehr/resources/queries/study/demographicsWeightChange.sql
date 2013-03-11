/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

  d.MostRecentWeightDate,
  d.MostRecentWeight AS MostRecentWeight,
  d.DaysSinceWeight,

  T3.MinLast30,
  T3.MaxLast30,
  T3.AvgLast30,
  T3.Weights30,

  CASE WHEN (abs((d.MostRecentWeight - T3.MinLast30) * 100 / d.MostRecentWeight) > abs((d.MostRecentWeight - T3.MaxLast30) * 100 / d.MostRecentWeight))
  THEN
    Round(((d.MostRecentWeight-T3.MinLast30) * 100 / d.MostRecentWeight), 1)
  ELSE
    Round(((d.MostRecentWeight - T3.MaxLast30) * 100 / d.MostRecentWeight), 1)
  END as MaxChange30,

  Round(((d.MostRecentWeight-T3.MinLast30) * 100 / d.MostRecentWeight), 1) as MaxGain30,
  Round(((d.MostRecentWeight - T3.MaxLast30) * 100 / d.MostRecentWeight), 1) as MaxLoss30,

  T4.MinLast90,
  T4.MaxLast90,
  T4.AvgLast90,
  T4.Weights90,

  CASE WHEN (abs((d.MostRecentWeight - T4.MinLast90) * 100 / d.MostRecentWeight) > abs((d.MostRecentWeight - T4.MaxLast90) * 100 / d.MostRecentWeight))
  THEN
    Round(((d.MostRecentWeight - T4.MinLast90) * 100 / d.MostRecentWeight), 1)
  ELSE
    Round(((d.MostRecentWeight - T4.MaxLast90) * 100 / d.MostRecentWeight), 1)
  END as MaxChange90,

  Round(((d.MostRecentWeight-T4.MinLast90) * 100 / d.MostRecentWeight), 1) as MaxGain90,
  Round(((d.MostRecentWeight - T4.MaxLast90) * 100 / d.MostRecentWeight), 1) as MaxLoss90,

  T5.MinLast180,
  T5.MaxLast180,
  T5.AvgLast180,
  T5.Weights180,

  CASE WHEN (abs((d.MostRecentWeight - T5.MinLast180) * 100 / d.MostRecentWeight) > abs((d.MostRecentWeight - T5.MaxLast180) * 100 / d.MostRecentWeight))
  THEN
    Round(((d.MostRecentWeight - T5.MinLast180) * 100 / d.MostRecentWeight), 1)
  ELSE
    Round(((d.MostRecentWeight - T5.MaxLast180) * 100 / d.MostRecentWeight), 1)
  END as MaxChange180,

  Round(((d.MostRecentWeight-T5.MinLast180) * 100 / d.MostRecentWeight), 1) as MaxGain180,
  Round(((d.MostRecentWeight - T5.MaxLast180) * 100 / d.MostRecentWeight), 1) as MaxLoss180

FROM study.demographicsMostRecentWeight d


--Find the min/max weight over last 30 days
LEFT OUTER JOIN
  (select T3.Id, max(T3.weight) as MaxLast30, min(T3.weight) as MinLast30, avg(t3.weight) as AvgLast30, count(T3.weight) as Weights30 FROM (SELECT id, date, weight FROM study.weight T3 WHERE T3.qcstate.publicdata = true AND T3.date > (curdate()-30)) T3 GROUP BY T3.Id) T3
  ON (T3.Id = d.Id)

--Find the min/max weight over last 90 days
LEFT OUTER JOIN
  (select T4.Id, max(T4.weight) as MaxLast90, min(T4.weight) as MinLast90, avg(t4.weight) as AvgLast90, count(T4.weight) as Weights90 FROM (SELECT id, date, weight FROM study.weight T4 WHERE T4.qcstate.publicdata = true AND T4.date > (curdate()-90)) T4 GROUP BY T4.Id) T4
  ON (T4.Id = d.Id)

--Find the min/max weight over last 180 days
LEFT OUTER JOIN
  (select T5.Id, max(T5.weight) as MaxLast180, min(T5.weight) as MinLast180, avg(t5.weight) as AvgLast180, count(T5.weight) as Weights180 FROM (SELECT id, date, weight FROM study.weight T5 WHERE T5.qcstate.publicdata = true AND T5.date > (curdate()-180)) T5 GROUP BY T5.Id) T5
  ON (T5.Id = d.Id)

--WHERE
--d.id.status.status = 'Alive'
--d.id.dataset.demographics.calculated_status = 'Alive'