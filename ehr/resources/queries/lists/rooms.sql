/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  DISTINCT c.room as room,

  CASE
    WHEN c.room like 'ab%' THEN 'AB'
    WHEN c.room like 'a%' THEN 'A'
    WHEN c.room like 'cb%' THEN 'CB'
    WHEN c.room like 'cif%' THEN 'CIF'
    WHEN c.room like 'c%' THEN 'C'
    WHEN c.room like 'mr%' THEN 'MR'
    ELSE null
  END as building
  
FROM lists.cage c

group by c.room