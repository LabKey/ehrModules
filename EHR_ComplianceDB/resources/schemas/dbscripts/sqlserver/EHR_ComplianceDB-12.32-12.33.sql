/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_compliancedb.employees ADD contactsSla bit default 0;
ALTER TABLE ehr_compliancedb.requirements ADD contactsSla bit;