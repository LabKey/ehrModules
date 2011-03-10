/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

s.id,

CASE
WHEN sum(convert(s.major, 'INTEGER')) > 0 THEN
  --WHEN max(s.major) = 'y' THEN
    true
      ELSE
    null
END AS MajorSurgery,

true As AnySurgery,

count(*) as NumberOfSurgeries

FROM study.surgery s
WHERE s.qcstate.publicdata = true

GROUP BY s.id


