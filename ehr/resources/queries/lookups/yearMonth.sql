/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  convert((year(curdate()) - i.key), integer) as year,
  m.month,
  m.rowid as MonthNum,
  
FROM lookups.integers i
LEFT OUTER JOIN lookups.months m

WHERE i.key < 5
