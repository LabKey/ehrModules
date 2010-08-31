/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  a.Id,
  CASE WHEN LastR.LastRoommate IS NULL THEN COALESCE(a.MostRecentArrival.MostRecentArrival, a.dataset.demographics.birth) ELSE LastR.LastRoommate END AS AloneSince,
  TIMESTAMPDIFF(SQL_TSI_DAY, CASE WHEN LastR.LastRoommate IS NULL THEN COALESCE(a.MostRecentArrival.MostRecentArrival, a.dataset.demographics.birth) ELSE LastR.LastRoommate END, NOW()) AS DaysAlone

FROM study.animal a
  LEFT JOIN
    (SELECT h3.Id, MAX(h3.odate) AS LastRoommate FROM study.housing h3 WHERE h3.TotalRoommates.TotalRoommates <> 0 GROUP BY h3.Id) LastR
    ON a.Id = LastR.Id

WHERE
  a.numRoommates.numRoommates = 0 

  AND a.Status.Status = 'Alive'