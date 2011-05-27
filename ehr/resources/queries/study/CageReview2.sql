/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
  c.roomcage,
  c.room,
  c.cage,
  h.TotalAnimals,
  round(h.TotalWeight, 2) as TotalWeight,

  --c.roomcage.length as length,
  --c.roomcage.width as width,
  round((c.roomcage.length * c.roomcage.width)/144, 1) as CageSqft,
  c1.sqft as ReqSqFt,

  c.roomcage.height as CageHeight,
  c1.height as ReqHeight,
  CASE WHEN ((c.roomcage.length * c.roomcage.width)/144) <  c1.sqft
    THEN 'Too Small'
    ELSE null
  END as sizeCheck,
  CASE WHEN c.roomcage.height < c1.height
    THEN 'Too Short'
    ELSE null
  END as heightCheck

FROM ehr_lookups.cages c

LEFT JOIN (
  SELECT
    h.room,
    h.cage,
    count(DISTINCT h.id) as TotalAnimals,
    sum(h.Id.mostRecentWeight.mostRecentWeight) as TotalWeight
    FROM study.housing h
    WHERE h.enddate IS NULL
    AND h.id.age.ageInMonths >= 6
    GROUP BY h.room, h.cage
  ) h

ON (c.room=h.room AND c.cage=h.cage)

LEFT JOIN ehr_lookups.cageclass c1

ON (c1.low < h.TotalWeight AND h.TotalWeight <= c1.high)

WHERE h.TotalAnimals is not null

AND (
  ((c.roomcage.length * c.roomcage.width)/144) <  c1.sqft
OR
  c.roomcage.height < c1.height
)

