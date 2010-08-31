/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  convert((year(curdate()) - i.key), integer) as year,
  m.monthName,
  m.key as MonthNum,
  
FROM lists.integers i 
LEFT OUTER JOIN lists.months m

WHERE i.key < 5
