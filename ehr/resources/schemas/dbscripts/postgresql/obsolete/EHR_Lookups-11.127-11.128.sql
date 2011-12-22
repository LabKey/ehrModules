/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

INSERT INTO ehr_lookups.clinpath_collection_method
(method) VALUES
('Cystocentesis'),
('Void'),
('Catheter')
;

INSERT INTO ehr_lookups.clinpath_tests
(testname, dataset)
VALUES
('Chol/HDL Ratio', 'Chemistry'),
('Osmolarity', 'Chemistry');
;