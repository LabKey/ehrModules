/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



ALTER TABLE ehr.supplemental_pedigree
    add column birth timestamp,
    add column acquiredate timestamp,
    add column departdate timestamp
;


