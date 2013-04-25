/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  m.id,
  count(distinct m.id) as totalGroups,
  group_concat(distinct m.groupId.name, chr(10)) as groups
FROM ehr.animal_group_members m
WHERE m.enddateCoalesced >= curdate()
GROUP BY m.id