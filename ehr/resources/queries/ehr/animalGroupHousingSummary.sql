/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  m.groupId,
  m.id.curLocation.room,
  count(distinct m.id) as totalAnimals

FROM ehr.animal_group_members m
WHERE m.enddateTimeCoalesced >= now()
GROUP BY m.groupId, m.id.curLocation.room