/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT

  h1.room as Room,
  h1.cage AS Cage,
  max(h1.cond) AS Condition,
  count(*) AS TotalAnimals

FROM study.Housing h1

WHERE h1.odate IS NULL
AND h1.qcstate.publicdata = true

GROUP BY h1.room, h1.cage



