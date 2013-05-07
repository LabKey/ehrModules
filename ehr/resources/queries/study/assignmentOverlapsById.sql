/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Protocol CHAR, Project INTEGER DEFAULT null)

SELECT
a.Id,
min(a.date) as earliestAssignment,
max(a.date) as latestAssignment

FROM study.assignment a

WHERE (
  (a.project = PROJECT OR PROJECT is null) AND
  (a.project.protocol = PROTOCOL OR PROTOCOL IS NULL OR PROTOCOL = '') AND

  (a.enddateCoalesced >= cast(StartDate as date)) AND
  (a.dateOnly <= cast(coalesce(EndDate, curdate()) as date))
)
GROUP BY a.id