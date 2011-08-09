/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

-- ----------------------------
-- Table structure for snomed_subsets
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.snomed_subsets;
CREATE TABLE ehr_lookups.snomed_subsets (
subset varchar(255) NOT NULL,

Container ENTITYID,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_snomed_subsets PRIMARY KEY (subset)
)
WITH (OIDS=FALSE)

;