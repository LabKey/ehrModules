/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Protocol CHAR, Project CHAR DEFAULT null)

SELECT
a.Id,
group_concat(distinct a.project.protocol.displayName) as protocols,
group_concat(distinct a.project.displayName) as projects,
min(a.date) as earliestAssignment,
max(a.date) as latestAssignment,
min(a.enddate) as earliestRelease,
max(a.enddate) as latestRelease,
ROUND(CONVERT(age_in_months(max(a.Id.demographics.birth), min(a.date)), DOUBLE) / 12, 1) AS ageOnEarliestAssignment,
group_concat(DISTINCT CAST(ifdefined(a.releaseType) as varchar(200))) as releaseTypes,
count(*) as totalAssignments

FROM study.assignment a

WHERE (
  -- Match on either project/protocol number or full display name, or skip the check if the user hasn't supplied a value
  (CAST(a.project AS VARCHAR) = PROJECT OR a.project.displayName = PROJECT OR PROJECT is null) AND
  (a.project.protocol = PROTOCOL OR a.project.protocol.displayName = PROTOCOL OR PROTOCOL IS NULL OR PROTOCOL = '') AND

  (a.enddateCoalesced >= cast(StartDate as date)) AND
  (a.dateOnly <= cast(coalesce(EndDate, curdate()) as date))
)
GROUP BY a.id