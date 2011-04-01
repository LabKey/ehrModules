/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
b.dam as id,
b.date,
'Birth' as type,
'Offspring: ' || b.id as remark
from study.birth b
WHERE b.qcstate.publicdata = true

UNION ALL

SELECT
v.id,
v.date,
'Viral Challenge' as type,
v.remark
from study.ViralChallenges v

UNION ALL

SELECT
s.id,
s.date,
'Surgery' as type,
'Major: '||s.major
from surgery s
where s.qcstate.publicdata = true

