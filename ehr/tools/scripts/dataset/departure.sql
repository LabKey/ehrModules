/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (authorize) AS authorize, (destination) AS destination, FixNewlines(remark) AS remark,
     ( CONCAT_WS(',\n', 
     CONCAT('Authorize: ', authorize),
     CONCAT('Destination: ', destination)
     ) ) AS Description
FROM departure

