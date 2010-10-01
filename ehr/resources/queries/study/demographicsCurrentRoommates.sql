/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  h.id,
  max(h.condition) as condition,
  count(h.RoommateId) AS NumRoommates,
--   group_concat(DISTINCT h.RoommateId) as Roommates

FROM study.housingRoommates h

WHERE h.RemovalDate is null AND h.RoommateEnd is null

GROUP BY h.id
