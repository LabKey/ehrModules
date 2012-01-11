/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT setval('ehr_lookups.treatment_frequency_rowid_seq', (select max(rowid) as maxVal from ehr_lookups.treatment_frequency));
SELECT setval('ehr_lookups.ageclass_rowid_seq', (select max(rowid) as maxVal from ehr_lookups.ageclass));