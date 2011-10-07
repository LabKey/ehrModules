/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
    entityid,
    title,
    formType,
    template,
    userId,
    description,

FROM ehr.formtemplates t

WHERE ISMEMBEROF(t.userId) or t.userid is null