
SELECT
    a.Id as resolvedId,
    a.alias as inputId,
    'alias' as resolvedBy,
    a.category as aliasType,
    LOWER(a.alias) as lowerAliasForMatching
FROM study.alias a
INNER JOIN study.demographics d ON a.Id = d.Id
