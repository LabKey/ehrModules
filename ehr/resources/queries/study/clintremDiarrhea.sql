/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

  c.id,
  c.date,
  convert(year(c.date), integer) as Year,
  monthname(c.date) AS monthName,
  convert(month(c.date), integer) AS monthNum,
  --convert(week(c.date), integer) as Week,
  convert(dayofmonth(c.date), integer) as Day,

FROM clinremarks c
WHERE c.remark like 'diarr%' and c.category = 'Clinical'
AND c.qcstate.publicdata = true