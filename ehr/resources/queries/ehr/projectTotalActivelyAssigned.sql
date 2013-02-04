/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  a.project,
  count(*) as activeAssignments

FROM study.assignment a
WHERE a.enddateCoalesced >= curdate()
GROUP BY a.project