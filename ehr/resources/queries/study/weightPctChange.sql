/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query contains a handful of calculated fields for the weights table
--it is designed to be joined into weights using objectID

SELECT
  w.objectId,
  w.Id,
  w.date,
  w.weight AS CurWeight,
  w2.PrevDate,
  w3.weight AS PrevWeight,
  Round(((w.weight - w3.weight) * 100 / w3.weight), 1) AS PctChange,
  Abs(Round(((w.weight - w3.weight) * 100 / w3.weight), 1)) AS AbsPctChange,
  timestampdiff('SQL_TSI_DAY', w3.date, w.date) AS Interval


FROM study.weight w
  --Find the next most recent weight date
  LEFT JOIN
    (SELECT T2.Id, T2.date, max(T1.date) as PrevDate
      FROM study.weight T1 JOIN study.weight T2 ON (T1.Id = T2.Id AND T1.date < T2.date) GROUP BY T2.Id, T2.date) w2
      ON (w.Id = w2.Id AND w.date = w2.date)

  LEFT JOIN study.weight w3
      ON (w.Id = w3.Id AND w3.date = w2.prevdate) 

