/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.rooms ADD housingType int;
ALTER TABLE ehr_lookups.rooms ADD housingCondition int;

DROP TABLE ehr_lookups.locations;