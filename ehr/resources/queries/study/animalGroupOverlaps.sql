/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  * This query is designed to find distinct animals that were part of a group at a given point in time
  */
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
  m.Id,
  m.groupId,

  max(StartDate) as StartDate,
  max(EndDate) as EndDate
FROM study.animal_group_members m

WHERE (
    /* entered startdate must be <= entered enddate */
    coalesce( StartDate , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(EndDate, now())
    AND

    /* entered startdate must be less than record's enddate */
    cast(coalesce( StartDate , cast('1900-01-01 00:00:00.0' as DATE)) AS DATE) <= m.enddateCoalesced

    and

    /* entered enddate must be greater than record's startdate */
    cast(coalesce(EndDate, curdate()) AS DATE) >= m.dateOnly
  )

GROUP BY m.groupId, m.id