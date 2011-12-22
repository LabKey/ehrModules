/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


ALTER TABLE ehr_lookups.cage
  drop column canJoinToNeighbor
;

ALTER TABLE ehr_lookups.cage
  ADD column joinToCage varchar(50)
;
