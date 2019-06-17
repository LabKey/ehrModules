/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
alter table ehr_lookups.rooms add dateDisabled datetime;
alter table ehr_lookups.rooms drop column category;
alter table ehr_lookups.areas add dateDisabled datetime;
