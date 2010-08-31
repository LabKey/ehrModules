/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

  c.id,
  c.date,
  convert(year(c.date), integer) as Year,
  monthname(c.date) AS monthName,
  convert(month(c.date), integer) AS monthNum,

  convert(dayofmonth(c.date), integer) as Day,

FROM clinremarks c WHERE c.remark like 'mens.%' and c.category = 'Clinical'
