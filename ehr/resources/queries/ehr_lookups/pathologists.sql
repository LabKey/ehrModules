/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select UserId.DisplayName as UserId from core.members m where m.groupid.name like '%pathology%';