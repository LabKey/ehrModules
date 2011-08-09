/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP) --, Area CHAR)

SELECT
d.lsid,
d.id,
-- d.HousingAtTime.areaAtTime as areaAtTime,
-- d.HousingAtTime.roomAtTime as roomAtTime,
-- d.HousingAtTime.cageAtTime as cageAtTime,
d.id.curLocation.area as Area,
d.id.curLocation.room as Room,
d.id.curLocation.cage as Cage,
d.date,
d.code,
d.qualifier,
d.dosage,
d.dosage_units,
d.concentration,
d.conc_units,
d.amount,
d.amount_units,
d.volume,
d.vol_units,
d.performedby,
d.remark,
d.taskid,
d.qcstate
FROM study."Drug Administration" d

WHERE
cast(d.date as date) >= cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP)
AND cast(d.date as date) <= CAST(COALESCE(ENDDATE, curdate())AS TIMESTAMP)
-- AND (Area is null or d.HousingAtTime.AreaAtTime = Area)