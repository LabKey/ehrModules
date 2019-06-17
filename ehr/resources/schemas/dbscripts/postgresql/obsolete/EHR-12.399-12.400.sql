/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.animal_group_members ADD releaseType VARCHAR(200);
ALTER TABLE ehr.animal_group_members ADD taskid entityid;
ALTER TABLE ehr.animal_group_members ADD qcstate integer;