/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.treatment_codes;
CREATE TABLE ehr_lookups.treatment_codes (
  meaning varchar(250) not null,
  code varchar(100),
  category varchar(100),
  route varchar(100),
  concentration numeric,
  conc_units varchar(100),
  dosage numeric,
  dosage_units varchar(100),
  volume numeric,
  vol_units varchar(100),
  amount numeric,
  amount_units varchar(100),

  CONSTRAINT PK_treatment_codes PRIMARY KEY (meaning)
);