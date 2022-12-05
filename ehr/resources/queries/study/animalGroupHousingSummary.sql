/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  m.groupId,
  m.id.curLocation.room,
  count(distinct m.id) as totalAnimals

FROM study.animal_group_members m
WHERE m.isActive = true
GROUP BY m.groupId, m.id.curLocation.room