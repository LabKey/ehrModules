/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

-- SELECT
--
-- sd.lsid,
-- sd.id,
-- sd.date,
--
-- cast((
--   SELECT  group_concat(DISTINCT h.project) as project FROM study.Assignment h
--   WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.enddate, curdate())
--   AND h.qcstate.publicdata = true
--   --GROUP BY h.id
-- ) as varchar) as AssignmentsAtTime
-- FROM study.studydata sd


SELECT

sd.lsid,
sd.id,
sd.date,
group_concat(DISTINCT h.project) as AssignmentsAtTime

FROM study.studydata sd
JOIN study.assignment h
  ON (
    sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.enddate, now())
    AND h.qcstate.publicdata = true
    )
group by sd.lsid, sd.id, sd.date
