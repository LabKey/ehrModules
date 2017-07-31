/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.protocol ADD COLUMN LSID LSIDtype;
ALTER TABLE ehr.project ADD COLUMN LSID LSIDtype;