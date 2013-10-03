/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select
e.employeeid

from ehr_compliancedb.employees e
where type = 'Trainer'
