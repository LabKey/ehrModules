/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

-- add some base table columns (i.e. description, dateDisabled, etc.)
ALTER TABLE ehr_lookups.snomed ADD description VARCHAR(4000);
ALTER TABLE ehr_lookups.snomed ADD dateDisabled DATETIME;
ALTER TABLE ehr_lookups.source ADD description VARCHAR(4000);
ALTER TABLE ehr_lookups.species_codes ADD genus VARCHAR(255);
ALTER TABLE ehr_lookups.species_codes ADD species VARCHAR(255);
ALTER TABLE ehr_lookups.species_codes ADD description VARCHAR(4000);
ALTER TABLE ehr_lookups.species_codes ADD dateDisabled DATETIME;
ALTER TABLE ehr_lookups.calculated_status_codes ADD description VARCHAR(4000);
ALTER TABLE ehr_lookups.cage_type ADD description VARCHAR(4000);
ALTER TABLE ehr_lookups.cage_type ADD dateDisabled DATETIME;