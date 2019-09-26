/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.project add contact_emails varchar(4000);
ALTER TABLE ehr.project DROP COLUMN qcstate;