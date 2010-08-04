/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDateTime(date, time) AS Date, (userid) AS userid, (feces) AS feces, (menses) AS menses, (behavior) AS behavior, (breeding) AS breeding, (other) AS other, (tlocation) AS tlocation, FixNewlines(remark) AS remark, (otherbehavior) AS otherbehavior,
     ( CONCAT_WS(',\n', 
     CONCAT('UserID: ', userid), 
     CONCAT('Feces: ', feces),
     CONCAT('Menses: ', menses),
     CONCAT('Behavior: ', behavior),
     CONCAT('Breeding: ', breeding),
     CONCAT('Other: ', other),
     CONCAT('T Location: ', tlocation),
     CONCAT('Other Behavior: ', otherbehavior)
     ) ) AS Description, ts, uuid AS objectid
FROM obs

