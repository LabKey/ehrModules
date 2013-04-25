/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  * This query is designed to find distinct animals that were part of a group at a given point in time
  */
PARAMETERS(Name CHAR DEFAULT NULL, STARTDATE TIMESTAMP, ENDDATE TIMESTAMP)

SELECT
  m.Id,
  m.groupId,
FROM ehr.animal_group_members m

WHERE
  (m.groupId.name = Name OR Name IS NULL or Name = '')

  AND (
    /* entered startdate must be <= entered enddate */
    coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(ENDDATE, now())
    AND

    /* entered startdate must be less than record's enddate */
    cast(coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as DATE)) AS DATE) <= m.enddateCoalesced

    and

    /* entered enddate must be greater than record's startdate */
    cast(coalesce(ENDDATE, curdate()) AS DATE) >= m.dateOnly
  )

GROUP BY m.groupId, m.id