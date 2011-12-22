/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



ALTER TABLE ehr.cage_observations
  add column no_observations boolean
;

ALTER TABLE ehr.requests
  add column remark varchar(4000)
;

ALTER TABLE ehr.cage_observations
  drop column roomcage
;
