/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (caseno) AS caseno, (account) AS account, FixNewlines(remark) AS Remark FROM biopsyhead
