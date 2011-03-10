/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT
  h1.lsid,
  --h1.id,
  --h1.StartDate,
  count(h1.RoommateId) AS TotalRoommates

FROM study.housingRoommates h1

--where h1.id='r95061'

GROUP BY
  h1.lsid


