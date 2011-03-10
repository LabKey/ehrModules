/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
o.lsid,
o.id,
o.id.curLocation.room as Room,
o.id.curLocation.cage as Cage,
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
o.description

from study.obs o
-- LEFT JOIN study.housing h
--   ON (h.id=o.id AND h.date<=o.date AND (o.date<=coalesce(h.odate, now()) ))

WHERE o.isIrregular = true
AND o.qcstate.publicdata = true

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
'Cage Observation' as description
FROM ehr.cage_observations c

--TODO: use to QCstate
--WHERE c.qcstate.publicdata = true

