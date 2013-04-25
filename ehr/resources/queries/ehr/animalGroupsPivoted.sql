/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
g.id,
g.groupId.name as name,
cast('yes' as varchar) as valueField

FROM ehr.animal_group_members g

WHERE (g.enddate IS NULL OR COALESCE(g.enddate, curdate()) >= curdate())

GROUP BY g.id, g.groupId.name

PIVOT valueField by name IN (select name FROM ehr.animal_groups)

