/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_compliancedb.requirements ADD container entityid;

--upgrade of sorts.  both wnprc/onprc should have a single container, so set container based on employees
UPDATE ehr_compliancedb.requirements SET container = (SELECT max(cast(c.container as varchar(38))) as container from ehr_compliancedb.employees c);
