/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
  T1.id,
  'Births' AS Category,
  T1.date,
  convert(year(T1.date), integer) AS Year
FROM study.Birth T1
WHERE T1.date IS NOT NULL
  AND T1.Id.Demographics.entry_cat_code = 1 -- 1 is Born at Tulane
  AND T1.qcstate.publicdata = true
  AND CAST(COALESCE(STARTDATE, '1900-01-01') as date) <= T1.date AND CAST(COALESCE(ENDDATE, curdate()) as date) >= cast(T1.date as date)

UNION ALL SELECT
  T2.id,
  'Arrivals' AS Category,
  max(T2.date),
  convert(year(max(T2.date)), INTEGER) AS Year
FROM study.Arrival T2
WHERE T2.date IS NOT NULL
  AND T2.qcstate.publicdata = true
  AND (T2.Id.Demographics.entry_cat_code IS NULL OR T2.Id.Demographics.entry_cat_code <> 1) -- 1 is Born at Tulane
  AND CAST(COALESCE(STARTDATE, '1900-01-01') as date) <= T2.date AND CAST(COALESCE(ENDDATE, curdate()) as date) >= cast(T2.date as date)
GROUP BY id

UNION ALL SELECT
  T3.id,
  'Departures' AS Category,
  max(T3.Date),
  convert(year(max(T3.date)), INTEGER) AS Year
FROM study.Departure T3
WHERE T3.date IS NOT NULL
  AND T3.qcstate.publicdata = true
  AND T3.Id.Demographics.disp_code = 10 -- 10 is transferred
  AND CAST(COALESCE(STARTDATE, '1900-01-01') as date) <= T3.date AND CAST(COALESCE(ENDDATE, curdate()) as date) >= cast(T3.date as date)
GROUP BY id

UNION ALL SELECT
  T4.id,
  'Deaths' AS Category,
  T4.date,
  convert(year(T4.date), INTEGER) AS Year
FROM study.Deaths T4
WHERE T4.date IS NOT NULL
  AND T4.qcstate.publicdata = true
  AND (T4.Id.Demographics.disp_code IS NULL OR T4.Id.Demographics.disp_code <> 10) -- 10 is transferred
  AND CAST(COALESCE(STARTDATE, '1900-01-01') as date) <= T4.date AND CAST(COALESCE(ENDDATE, curdate()) as date) >= cast(T4.date as date)
