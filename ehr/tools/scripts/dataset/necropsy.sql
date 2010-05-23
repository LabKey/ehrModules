/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, (caseno) AS caseno, (account) AS account,
     ( CONCAT_WS(',\n',
        concat('Case No: ', caseno),
        CONCAT('Account: ', account)
        )) AS Description, ts, uuid AS objectid
FROM necropsyhead

