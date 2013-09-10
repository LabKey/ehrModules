SELECT
  k.Id,
  k.Id2,
  k.coefficient

FROM ehr.kinship k

UNION ALL

SELECT
  k.Id2 as Id,
  k.Id as Id2,
  k.coefficient

FROM ehr.kinship k
WHERE k.Id != k.Id2