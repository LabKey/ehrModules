/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
alias,
count(*) as total

FROM ehr_billing.aliases
GROUP BY alias
HAVING COUNT(*) > 1