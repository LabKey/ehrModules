/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  o.groupId,
  count(distinct o.id) as totalAnimals,

  max(o.StartDate) as StartDate,
  max(o.EndDate) as EndDate

FROM study.animalGroupOverlaps o

GROUP BY o.groupId