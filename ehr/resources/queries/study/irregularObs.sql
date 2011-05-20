/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
o.lsid,
o.id,
-- o.id.curLocation.room as Room,
-- o.id.curLocation.cage as Cage,
o.id.dataset.demographics.room as Room,
o.id.dataset.demographics.cage as Cage,
o.date,
-- convert((year(o.date) || '-' || month(o.date) || '-' || dayofmonth(o.date) || '-'), 'DATE') as DateOnly,
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
o.description,
o.qcstate

from study.obs o


WHERE o.isIrregular = true
--AND o.qcstate.publicdata = true

UNION ALL

SELECT
c.objectid,
null as id,
c.room,
c.cage,
c.date,
-- -- convert((year(c.date) || '-' || month(c.date) || '-' || dayofmonth(c.date) || '-'), 'DATE') as DateOnly,
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
'Cage Observation' as description,
c.qcstate
FROM ehr.cage_observations c
--WHERE c.qcstate.publicdata = true

