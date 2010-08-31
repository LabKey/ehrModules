/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

p.Created as StartTime,

(now() - p.Created) as TimeSinceUpload,

--hour((now() - p.Created)/24) as HoursSinceUpload,

p.status

FROM pipeline.job p

WHERE p.description = 'Study reload'

