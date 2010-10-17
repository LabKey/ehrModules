/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

i.RoomAtTime,
i.CageAtTime,
i.id,
i.Room,
i.Cage,
i.date,
i.DateOnly,
'Obs' as type,
i.userid,
i.remark,
i.description

from study.irregularObs i

UNION ALL

SELECT

t.CurrentRoom as RoomAtTime,
t.CurrentCage as CageAtTime,
t.id,
t.CurrentRoom as Room,
t.CurrentCage as Cage,
t.date,
t.date as DateOnly,
'Treatment' as type,
t.userid,
t.remark,
t.description

FROM treatmentSchedule t


