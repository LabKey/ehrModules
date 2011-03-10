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
  AND o.qcstate.publicdata = true

UNION ALL

SELECT

null as id,
c.room,
c.cage,
c.date,
cast(c.date as DATE) as DateOnly,
c.userid,
null as feces,
null as menses,
null as behavior,
null as breeding,
null as other,
null as tlocation,
null as otherbehavior,
c.remark,
null as dataset,
null as description

FROM ehr.cage_observations c

--TODO
--WHERE c.qcstate.publicdata = true



