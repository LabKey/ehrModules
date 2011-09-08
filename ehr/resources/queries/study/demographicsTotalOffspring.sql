/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
group_concat(d2.id) as Offspring,
count(d2.id)  AS TotalOffspring


FROM study.Demographics d

JOIN study.Demographics d2
  ON (d.Id = d2.sire OR d.Id = d2.dam)

GROUP BY d.id

