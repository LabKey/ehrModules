/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

 --NOTE: this is joined to demographics such that animals never tested for TB
 --will still get a value for MonthsSinceLastTB
select
  d.Id,
  max(T.date) as MostRecentTBDate,
  case
    WHEN max(T.date) IS NULL THEN 9999
    ELSE age_in_months(max(T.date), curdate())
  END AS MonthsSinceLastTB

from study.demographics d
LEFT JOIN study.tb T
ON (d.id = t.id AND T.qcstate.publicdata = true)


GROUP BY d.Id


