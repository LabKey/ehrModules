/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


alter TABLE ehr.requests
  add column notify3 integer
;


alter TABLE ehr.protocol
  add column maxAnimals integer
;
