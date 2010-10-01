/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

b.lsid,
max(w.date) as LastWeighDate

from study.blood b

LEFT JOIN study.weight w
    ON (w.Id = b.Id AND w.date <= b.date)

GROUP BY
b.lsid

