/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


UPDATE ehr_lookups.arearooms
SET area = 'AB-Old'
WHERE area = 'SPF';

UPDATE ehr_lookups.arearooms
set area = 'AB-New'
WHERE area = 'NSPF';


UPDATE ehr_lookups.areas
SET area = 'AB-Old'
WHERE area = 'SPF';

UPDATE ehr_lookups.areas
set area = 'AB-New'
WHERE area = 'NSPF';