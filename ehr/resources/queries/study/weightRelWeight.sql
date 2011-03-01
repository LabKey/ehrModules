/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query contains a handful of calculated fields for the weights table
--it is designed to be joined into weights using lsid

SELECT
  w.lsid,
  w.Id,
  w.date,
  w2.LastWeightDate,
  timestampdiff('SQL_TSI_DAY', w3.date, w.date) AS Interval,

  w3.weight AS LastestWeight,
  w.weight AS Weight,
  Round(((w.weight - w3.weight) * 100 / w3.weight), 1) AS PctChange,
  Abs(Round(((w.weight - w3.weight) * 100 / w3.weight), 1)) AS AbsPctChange,


FROM study.weight w
  --Find the next most recent weight date
  JOIN
    (SELECT t1.Id, max(T1.date) as LastWeightDate
      FROM study.weight T1 GROUP BY T1.Id) w2
      ON (w.Id = w2.Id)

  JOIN study.weight w3
      ON (w3.Id = w2.Id AND w3.date = w2.LastWeightDate)

