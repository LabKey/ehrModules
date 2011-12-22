/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


update ehr_lookups.conc_units set numerator = 'mL'
where unit = 'g/mL'
;
