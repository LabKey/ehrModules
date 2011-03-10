/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

  T1.MostRecentDeparture,

FROM study.demographics d


--date of most recent departure
LEFT JOIN
  (select T1.Id, max(T1.date) as MostRecentDeparture FROM study.departure T1 WHERE T1.qcstate.publicdata = true GROUP BY T1.Id) T1
  ON (T1.Id = d.Id)