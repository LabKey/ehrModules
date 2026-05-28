/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
    Id as resolvedId,
    Id as inputId,
    'direct' as resolvedBy,
    NULL as aliasType,
    LOWER(Id) as lowerIdForMatching
FROM study.demographics
