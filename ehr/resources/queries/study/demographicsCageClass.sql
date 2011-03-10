/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
d.id.MostRecentWeight.MostRecentWeight as MostRecentWeight,
 
c.sqft as ReqSqFt,

c.height as ReqHeight

from study.demographics d

LEFT JOIN ehr_lookups.cageclass c

ON (c.low < d.id.MostRecentWeight.MostRecentWeight AND d.id.MostRecentWeight.MostRecentWeight <= c.high)

WHERE

--TODO: use status instead
d.death is null AND (d.departdate IS NULL OR d.departdate < d.arrivedate) AND (d.birth is not null or d.arrivedate is not null)