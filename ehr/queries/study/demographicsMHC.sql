/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

s.id,
s1.Status as A01,
s2.Status as A02,
s3.Status as A11,
s4.Status as B08,
s5.Status as B17,

FROM study.SSP_Summary s

LEFT JOIN study.SSP_Summary s1 ON (s.Allele = 'Mamu-A*01' AND s.id = s1.id)

LEFT JOIN study.SSP_Summary s2 ON (s.Allele = 'Mamu-A*02' AND s.id = s2.id)

LEFT JOIN study.SSP_Summary s3 ON (s.Allele = 'Mamu-A*11' AND s.id = s3.id)

LEFT JOIN study.SSP_Summary s4 ON (s.Allele = 'Mamu-B*08' AND s.id = s4.id)

LEFT JOIN study.SSP_Summary s5 ON (s.Allele = 'Mamu-B*17' AND s.id = s5.id)

