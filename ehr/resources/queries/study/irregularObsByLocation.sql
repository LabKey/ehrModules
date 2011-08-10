/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

o.id,
-- o.id.curLocation.area as Area,
-- o.id.curLocation.room as Room,
-- o.id.curLocation.cage as Cage,
--o.id.dataset.demographics.room as Room,
--o.id.dataset.demographics.cage as Cage,

o.id.dataset.activehousing.area as area,
o.id.dataset.activehousing.room as room,
o.id.dataset.activehousing.cage as cage,

o.date,
cast(o.date as DATE) as DateOnly,
o.performedby as userid,
o.feces,
o.menses,
o.behavior,
o.breeding,
o.other,
o.tlocation,
o.otherbehavior,
o.remark,
o.dataset,
o.description,
o.qcstate,
o.taskid,
o.isIrregular

from study."Irregular Observations" o

--WHERE  o.isIrregular = true
  --AND o.qcstate.publicdata = true

UNION ALL

SELECT

null as id,
c.room.area as area,
c.room,
c.cage,
c.date,
cast(c.date as DATE) as DateOnly,
c.userid,
c.feces as feces,
null as menses,
null as behavior,
null as breeding,
null as other,
null as tlocation,
null as otherbehavior,
c.remark,
null as dataset,
c.description,
c.qcstate,
c.taskid,
true as isIrregular
FROM ehr.cage_observations c

--WHERE c.qcstate.publicdata = true



