/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  m.Id,
  count(distinct m.rowid) as totalGroups,
  group_concat(distinct m.name, chr(10)) as groups

FROM (

SELECT
  m.Id,
  m.rowid,
  m.groupId.name as name
FROM ehr.animal_group_members m
WHERE m.isActive = true

UNION ALL

SELECT
  f.Id,
  null as rowid, --so we exclude these when counting total groups
  f.value as name
FROM study.flags f
WHERE f.isActive = true AND f.value IN ('Pending Social Group', 'AUC Reserved')

) m
GROUP BY m.id