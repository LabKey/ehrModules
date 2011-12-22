/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


UPDATE ehr_lookups.cageclass
set sqft = 1.6
WHERE low=0 AND high=1.5 ;
