/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT

h1.date,
h2.id,
h2.project,
h2.project.account,

--find total assignments on this day
group_concat(h3.project) AS projects,
count(h3.project) AS total,

FROM ehr_lookups.next30Days h1

JOIN study.assignment h2
    ON (h1.Date >= h2.date AND h1.Date < COALESCE(h2.enddate, curdate()))

LEFT JOIN study.assignment h3
    ON (h1.Date >= h3.date AND h1.Date < COALESCE(h3.enddate, curdate()))



-- WHERE
-- h2.qcstate.publicdata = true
-- AND h3.qcstate.publicdata = true

GROUP BY h1.date, h2.id, h2.project, h2.project.account