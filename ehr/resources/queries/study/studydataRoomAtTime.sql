/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

sd.lsid,
sd.id,
sd.date,

cast((
  SELECT  group_concat(DISTINCT h.room) as room FROM study.Housing h
  WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.odate, curdate())
  AND h.qcstate.publicdata = true
  --GROUP BY h.id
) as varchar) as RoomAtTime,
cast((
  SELECT  group_concat(h.cage) as cage FROM study.Housing h
  WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.odate, curdate())
  AND h.qcstate.publicdata = true
  --GROUP BY h.id
) as varchar) as CageAtTime,
cast((
  SELECT  group_concat(h.room.area) as area FROM study.Housing h
  WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.odate, curdate())
  AND h.qcstate.publicdata = true
  --GROUP BY h.id
) as varchar) as AreaAtTime,
-- cast((
--   SELECT  group_concat((h.room || h.cage)) as location FROM study.Housing h
--   WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.odate, curdate())
--   --GROUP BY h.id
-- ) as varchar) as location,

-- sd.feces
FROM study.studydata sd

-- where sd.date >= '4/1/2010' and sd.date <= '12/31/2010'


