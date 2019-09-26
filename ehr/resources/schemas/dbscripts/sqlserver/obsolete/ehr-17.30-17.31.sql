/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

-- add LSID column to tables to allow them to be extensible
ALTER TABLE ehr.protocol_counts ADD lsid LsidType;
ALTER TABLE ehr.snomed_tags ADD lsid LsidType;