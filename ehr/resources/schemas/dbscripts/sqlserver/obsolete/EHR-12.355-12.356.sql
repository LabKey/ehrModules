/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.requests ADD sendemail bit;
ALTER TABLE ehr.reports ADD subjectIdFieldName varchar(200);
