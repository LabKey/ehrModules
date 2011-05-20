/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  T1.id,
  T1.species,
  'Births' AS Category,
  T1.birth as Date,
  convert(year(T1.birth), integer) AS Year,

FROM study.Demographics T1
WHERE T1.birth IS NOT NULL

UNION ALL

SELECT
  T2.id,
  T2.id.dataset.demographics.species,
  'Arrivals' AS Category,
  T2.date,
  convert(year(T2.date), INTEGER) AS Year,

FROM study.Arrival T2
WHERE T2.date IS NOT NULL
AND T2.qcstate.publicdata = true

UNION ALL

SELECT
  T3.id,
  T3.id.dataset.demographics.species,
  'Departures' AS Category,
  T3.Date,
  convert(year(T3.date), INTEGER) AS Year,

FROM study.Departure T3
WHERE T3.date IS NOT NULL
AND T3.qcstate.publicdata = true

UNION ALL

SELECT
  T4.id,
  T4.id.dataset.demographics.species,
  'Deaths' AS Category,
  T4.death as Date,
  convert(year(T4.death), INTEGER) AS Year,

FROM study.Demographics T4
WHERE T4.death IS NOT NULL
