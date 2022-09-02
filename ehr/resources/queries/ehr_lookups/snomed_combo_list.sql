/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
s.code,
s.meaning,
group_concat(ss.primaryCategory) as categories,
(s.meaning || ' (' || s.code || ')') as codeAndMeaning

FROM ehr_lookups.snomed s
LEFT JOIN ehr_lookups.snomed_subset_codes ss ON (s.code = ss.code)
--Added by Kolli to exclude the entries where datedisabled is not empty
Where s.datedisabled is NULL
GROUP BY s.code, s.meaning