/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

o.id,
o.id.curLocation.room as Room,
o.id.curLocation.cage as Cage,
o.date,
cast(o.date as DATE) as DateOnly,
o.userid,
o.feces,
o.menses,
o.behavior,
o.breeding,
o.other,
o.tlocation,
o.otherbehavior,
o.remark,
o.dataset,
o.description

from study.obs o

WHERE
  o.isIrregular = true

UNION ALL

SELECT

null as id,
c.RoomAtTime as room,
c.CageAtTime as cage,
c.date,
cast(c.date as DATE) as DateOnly,
c.observationRecord.userid,
null as feces,
null as menses,
null as behavior,
null as breeding,
null as other,
null as tlocation,
null as otherbehavior,
c.observationRecord.note as Remark,
--cn.note as Remark,
null as dataset,
'Cage Observation' as description

FROM study."Cage Observations" c
 --JOIN lists.cagenotes cn ON (c.observationRecord = cn.objectid)





