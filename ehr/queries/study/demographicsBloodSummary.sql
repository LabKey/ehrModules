/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

  COALESCE(T6.quantity, 0) AS BloodLast30,

  T9.weight AS MostRecentWeight,

  T8.MostRecentWeightDate,

  round(T9.weight*0.2*60, 1) AS MaxBlood,

  round((T9.weight*0.2*60) - COALESCE(T6.quantity, 0), 1) AS AvailBlood,



FROM study.demographics d

--we calculate the total blood drawn in the last 30 days
LEFT JOIN
    (SELECT T6.Id, sum(T6.quantity) AS quantity FROM study.blood T6 where T6.date >= (curdate() - 30) GROUP BY T6.Id) T6
    ON (T6.Id = d.Id)

--Find the most recent weight date
LEFT JOIN
  (select T8.Id, max(T8.date) as MostRecentWeightDate FROM study.weight T8 GROUP BY T8.Id) T8
  ON (T8.Id = d.Id)

--find the most recent weight
LEFT JOIN study.weight T9
  ON (T8.MostRecentWeightDate = T9.date AND T9.Id = d.Id)

WHERE d.id.status.status = 'Alive'