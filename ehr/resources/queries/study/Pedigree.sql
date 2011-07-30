/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id as Id,
d.dam as Dam,
d.sire as Sire,

--TODO: handle gender better
/*
CASE d.gender
  WHEN 'm' THEN 'male'
  WHEN 'f' THEN 'female'
  WHEN 'e' THEN 'male'
  WHEN 'c' THEN 'female'
  WHEN 'v' THEN 'male'
  ELSE 'unknown'
END AS gender,
*/
-- CONVERT(
CASE (d.gender)
  WHEN 'm' THEN 1
  WHEN 'f' THEN 2
  WHEN 'e' THEN 1
  WHEN 'c' THEN 2
  WHEN 'v' THEN 1
  ELSE 3
END
-- , INTEGER)
AS gender,
'Demographics' as source

--d.qcstate

FROM study.demographics d

WHERE d.gender != '' AND d.gender != 'h'
AND (d.dam is not NULL or d.sire is not null)

UNION ALL

SELECT

p.id as Id,
p.dam as Dam,
p.sire as Sire,
CASE (p.gender)
  WHEN 'm' THEN 1
  WHEN 'f' THEN 2
  WHEN 'e' THEN 1
  WHEN 'c' THEN 2
  WHEN 'v' THEN 1
  ELSE 3
END AS gender,
'Supplemental Pedigree' as source
--null as qcstate

FROM ehr.supplemental_pedigree p
LEFT JOIN study.demographics d ON (d.id=p.id)
WHERE
d.id is null AND p.gender != '' and p.gender is not null
AND (p.dam is not NULL or p.sire is not null)
