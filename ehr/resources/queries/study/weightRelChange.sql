/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query contains a handful of calculated fields for the weights table
--it is designed to be joined into weights using lsid

SELECT
  w.lsid,
  w.Id,
  w.date,
  w.Id.dataset.demographics.wdate as LatestWeightDate,
  w.Id.dataset.demographics.weight AS LatestWeight,

  timestampdiff('SQL_TSI_DAY', w.date, w.Id.dataset.demographics.wdate) AS IntervalInDays,
  age_in_months(w.date, w.Id.dataset.demographics.wdate) AS IntervalInMonths,

  w.weight,
  Round(((w.weight - w.Id.dataset.demographics.weight) * 100 / w.Id.dataset.demographics.weight), 1) AS PctChange,
  Abs(Round(((w.weight - w.Id.dataset.demographics.weight) * 100 / w.Id.dataset.demographics.weight), 1)) AS AbsPctChange,

FROM study.weight w

WHERE w.qcstate.publicdata = true