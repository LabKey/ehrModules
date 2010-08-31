/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query is designed to be joined into Assignment using objectid
--TODO: Add COALESCE

SELECT
  a1.objectid,

  --the total number of assignments overlapping with this record
  --COUNT(a2.Id) as OverlappingAssignments,

  --the total number of assignments on this animal overlapping with this record
  COUNT(a1.CoAssigned) as ConcurrentAssignments

FROM study.assignmentCoAssignedAnimals a1

WHERE a1.rdate IS NULL

GROUP BY a1.objectid

