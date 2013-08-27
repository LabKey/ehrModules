/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  m.id,
  count(distinct m.id) as totalGroups,
  group_concat(distinct m.groupId.name, chr(10)) as groups,
  max(m.enddateCoalesced) as dateLastAssigned,
  timestampdiff('SQL_TSI_DAY', max(m.enddateCoalesced), now()) as daysSinceLastAssignment

FROM ehr.animal_group_members m
GROUP BY m.id