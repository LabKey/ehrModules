/*
 * Copyright (c) 2013-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE viral_load_assay.abi7500_detectors (
  rowid serial,
  assayName varchar(200),
  detector varchar(200),
  fluor varchar(200),

  constraint PK_abi7500_detectors PRIMARY KEY (rowid)
);

CREATE TABLE viral_load_assay.fluors (
  name varchar(200),

  constraint PK_fluors PRIMARY KEY (name)
);

-- @SkipOnEmptySchemasBegin
INSERT INTO viral_load_assay.fluors (name) VALUES ('FAM');
-- @SkipOnEmptySchemasEnd
