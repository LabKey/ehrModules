/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

w.id,
w.MostRecentWeightDate,
timestampdiff('SQL_TSI_DAY', w.MostRecentWeightDate, curdate()) AS DaysSinceWeight,

t2.weight as MostRecentWeight

FROM (
SELECT
  w.Id AS Id,
  max(w.date) AS MostRecentWeightDate,

FROM study.weight w
GROUP BY w.id
) w

--find the most recent weight associated with that date
LEFT JOIN study.weight T2
  ON (w.MostRecentWeightDate = t2.date AND w.Id = t2.Id)