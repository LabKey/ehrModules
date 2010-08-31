/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  a.Id AS Id,

  T8.MostRecentWeightDate AS MostRecentWeightDate,

  timestampdiff('SQL_TSI_DAY', T8.MostRecentWeightDate, curdate()) AS DaysSinceWeight,

  T9.weight AS MostRecentWeight,

FROM study.demographics a

--Find the most recent weight date
LEFT JOIN
  (select T8.Id, max(T8.date) as MostRecentWeightDate FROM study.weight T8 GROUP BY T8.Id) T8
  ON (T8.Id = a.Id)

--find the most recent weight
LEFT JOIN study.weight T9
  ON (T8.MostRecentWeightDate = T9.date AND T9.Id = a.Id)