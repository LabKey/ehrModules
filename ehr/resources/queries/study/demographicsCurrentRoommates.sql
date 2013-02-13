/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.id,
  count(DISTINCT h.RoommateId) as NumRoommates,
  (count(DISTINCT h.RoommateId)+1) as AnimalsInCage,
  group_concat(DISTINCT h.RoommateId) as cagemates

FROM study.demographics d
LEFT JOIN study.housingRoommates h
  ON (h.id = d.id AND h.RemovalDate is null AND h.RoommateEnd is null)

WHERE d.calculated_status='Alive'

GROUP BY d.id
