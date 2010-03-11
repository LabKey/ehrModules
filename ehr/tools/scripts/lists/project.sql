/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT pno, UCASE(protocol) as protocol, account, inves, avail, title, research, reqname  FROM project p
