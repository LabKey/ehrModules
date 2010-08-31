/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
b.id,
b.date,
'Birth' as type,
'Offspring: ' || b.id as comment
from study.birth b

UNION ALL

SELECT
v.id,
v.date,
'Viral Challenge' as type,
'Pathogen: ' || v.pathogen as comment
from study.demographicsViralChallenge v

UNION ALL

SELECT
s.id,
s.date,
'Surgery' as type,
'Major: '||s.major as comment
from surgery s


