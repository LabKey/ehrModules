/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

t.id,

CASE
  WHEN (t.s1 = t.s2 and t.d1 = t.d2 AND t.s1!='' AND t.d1!='')
    THEN 'Full Sib'
  WHEN (t.s1 = t.s2 AND t.s1 != '' AND (t.d1 != t.d2 OR t.d1 = ''))
    THEN 'Half-Sib Paternal'
  WHEN (t.d1 = t.d2 AND t.d1 != '' AND (t.s1 != t.s2 OR t.s1 = ''))
    THEN 'Half-Sib Maternal'
  WHEN (t.s1 != t.s2 and t.d1 != t.d2)
    THEN 'ERROR'
  END AS Relationship,

t.sib  AS Sibling,

--t.d1,
--t.s1,
t.dam2 AS SiblingDam,
t.sire2 AS SiblingSire,

FROM (

SELECT d1.id, d2.id as sib, d2.dam as dam2, d2.sire as sire2,
--coalesce used to simplify CASE comparison above
COALESCE(d1.dam, '') as d1, COALESCE(d2.dam, '') as d2, COALESCE(d1.sire, '') as s1, COALESCE(d2.sire, '') as s2

FROM study.Demographics d1

LEFT JOIN study.Demographics d2
  ON ((d2.sire = d1.sire OR d2.dam = d1.dam) AND d1.id != d2.id)

WHERE d2.id is not null

) t

