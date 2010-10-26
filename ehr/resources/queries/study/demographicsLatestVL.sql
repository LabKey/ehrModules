/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
max(v.ViralLoad) as LatestViralLoad,
max(v.date) as LatestViralLoadDate

FROM study.Demographics d

LEFT JOIN study.ViralLoads v
  on (d.id = v.id)

WHERE v.id is not null

GROUP BY d.id


