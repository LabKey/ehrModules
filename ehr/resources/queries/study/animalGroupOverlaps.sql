/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  * This query is designed to find distinct animals that were part of a group at a given point in time
  */
PARAMETERS(Name CHAR DEFAULT NULL, Date TIMESTAMP)

SELECT
  m.Id,
  m.groupId
FROM ehr.animal_group_members m

WHERE
  (m.groupId.name = Name OR Name IS NULL or Name = '')
  AND m.date <= CAST(Date as date) AND m.enddateCoalesced >= CAST(Date as date)

GROUP BY m.groupId, m.id