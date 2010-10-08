/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

t.lsid,

convert((year(t.date) || '-' || month(t.date) || '-' || dayofmonth(t.date) || '-'), 'DATE') as DateOnly

FROM study.treatments t

