/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
i.Id,
i.year,
i.monthName,
i.monthNum,
i.day,
group_concat(DISTINCT i.feces) as feces

FROM (

SELECT
  i.Id,
  i.date,
  convert(year(i.date), integer) as year,
  monthname(i.date) AS monthName,
  convert(month(i.date), integer) AS monthNum,
  --convert(week(i.date), integer) as Week,
  convert(dayofmonth(i.date), integer) as day,
  i.feces

FROM study.obs i
WHERE i.feces is not NULL
--AND i.qcstate.publicdata = true

UNION ALL

SELECT
  o.Id,
  o.date,
  convert(year(o.date), integer) as year,
  monthname(o.date) AS monthName,
  convert(month(o.date), integer) AS monthNum,
  --convert(week(o.date), integer) as Week,
  convert(dayofmonth(o.date), integer) as day,
  o.feces || '**' as feces

FROM study."Cage Observations" o
WHERE o.feces is not NULL

) i

GROUP BY i.id, i.year, i.monthName, i.monthNum, i.day
PIVOT feces BY day