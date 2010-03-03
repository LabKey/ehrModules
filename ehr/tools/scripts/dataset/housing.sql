/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(idate, itime) AS date, room, cage, cond, FixDateTime(odate, otime) AS odate,
    CONCAT_WS(',\n',
    CONCAT('Room: ', room),
    CONCAT('Cage: ', cage),
    CONCAT('Condition: ', cond),
    CONCAT('In Time: ', FixDateTime(idate, itime)),
    CONCAT('Out Time: ', FixDateTime(odate, otime))

    ) AS Description
FROM housing

