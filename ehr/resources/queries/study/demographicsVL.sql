/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
-- max(v.)

FROM study.Demographics d

LEFT JOIN study.ViralLoadsWpi v
  on (d.id = v.id)
GROUP BY d.id


