/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  a.Id AS Id,

  T11.MostRecentTBDate,

  age_in_months(T11.MostRecentTBDate, curdate()) AS MonthsSinceLastTB,

FROM study.demographics a


--date of most recent TB test
LEFT JOIN
  (select T11.Id, max(T11.date) as MostRecentTBDate FROM study.tb T11 WHERE T11.qcstate.publicdata = true GROUP BY T11.Id) T11
  ON (T11.Id = a.Id)

