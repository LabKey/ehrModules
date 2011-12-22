/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

INSERT INTO ehr_lookups.amount_units VALUES ('ounces');

ALTER table ehr_lookups.treatment_codes
  add column qualifier varchar(200)
  ;