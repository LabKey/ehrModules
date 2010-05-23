/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) as date, account, suspvirus, remark, clinremark,
concat_ws(',\n',
     CONCAT('Suspvirus: ', suspvirus),
     CONCAT('Remark: ', remark),
     CONCAT('Clin Remark: ', clinremark)
     ) AS Description, ts, uuid AS objectid

FROM virisohead

