/*
 * Copyright (c) 2010 LabKey Corporation
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
AS gender

FROM study.demographics d

WHERE d.gender != '' AND d.gender != 'h'


