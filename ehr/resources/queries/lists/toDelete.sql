/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Select
d.id,
d.orig_id,
d.uuid,
d.ts
FROM lists.deleted_records d
Left join study.studydata s on (d.uuid like s.lsid)