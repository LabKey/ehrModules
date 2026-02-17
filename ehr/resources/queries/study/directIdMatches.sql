
SELECT
    Id as resolvedId,
    Id as inputId,
    'direct' as resolvedBy,
    NULL as aliasType,
    LOWER(Id) as lowerIdForMatching
FROM study.demographics
