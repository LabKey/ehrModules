/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

INSERT INTO ehr_lookups.condition_codes VALUES ('gb', 'group breeding');


delete from ehr_lookups.dental_gingivitis where result = 'Not Recorded';
INSERT INTO ehr_lookups.dental_gingivitis VALUES ('Not Recorded', 1);


delete from ehr_lookups.dental_tartar where result = 'Not Recorded';
INSERT INTO ehr_lookups.dental_tartar VALUES ('Not Recorded');


update ehr_lookups.blood_billed_by set title = 'SPI' where code = 'c';

delete from ehr_lookups.bcs_score where score = '3.5';
INSERT INTO ehr_lookups.bcs_score VALUES ('3.5', 'Slightly Overweight', null);