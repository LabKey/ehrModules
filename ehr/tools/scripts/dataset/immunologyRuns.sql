/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT lower(id) as id, FixDate(date) AS Date, 
uuid as requestId,
ts, uuid AS objectid
FROM immunores

