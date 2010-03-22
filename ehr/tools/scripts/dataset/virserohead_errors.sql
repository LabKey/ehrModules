/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) as date, account, remark, clinremark,
concat_ws(',\n',
     CONCAT('Remark: ', remark),
     CONCAT('Clin Remark: ', clinremark)
     ) AS Description

FROM virserohead
WHERE date = '0000-00-00' OR id = ''
