/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.labwork_panels ADD method varchar(200);
ALTER TABLE ehr_lookups.labwork_panels ADD testfieldname varchar(200);