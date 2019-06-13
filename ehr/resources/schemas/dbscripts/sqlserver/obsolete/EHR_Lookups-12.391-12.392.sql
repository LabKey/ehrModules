/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.treatment_frequency ADD shortname varchar(200);
ALTER TABLE ehr_lookups.treatment_frequency ADD legacyname varchar(200);