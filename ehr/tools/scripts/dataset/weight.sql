/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDateTime(date, time) AS Date, (weight) AS weight, (verified) AS verified,
( CONCAT_WS(',\n', 
     CONCAT('Weight: ', CAST(weight AS CHAR))
) ) AS Description, ts, uuid AS objectid
FROM weight

