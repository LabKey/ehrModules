/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
    a.Id as resolvedId,
    a.alias as inputId,
    'alias' as resolvedBy,
    a.category as aliasType,
    LOWER(a.alias) as lowerAliasForMatching
FROM study.alias a
