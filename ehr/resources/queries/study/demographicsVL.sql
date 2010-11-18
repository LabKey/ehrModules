/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

v.id,
v.LatestChallengeDate,

FROM (
SELECT
  v.id,
  max(v.ChallengeDate) as LatestChallengeDate,
FROM study.ViralLoadsWpi v
GROUP BY v.id
) v

left join study.ViralLoadsWpi v2
on (v.id = v2.id and v.LatestChallengeDate=v2.date)
