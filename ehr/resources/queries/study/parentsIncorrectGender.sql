SELECT *
FROM (
SELECT
    d1.Id,
    d1.gender,
    d1.species,
    d2.Id as damId,
    d2.gender as damGender,
    d3.Id as sireId,
    d3.gender as sireGender,
    CASE WHEN (d2.gender IS NOT NULL AND upper(d2.gender.meaning) NOT IN ('FEMALE', 'UNKNOWN', 'UNDETERMINED')) OR
              (d3.gender IS NOT NULL AND upper(d3.gender.meaning) NOT IN  ('MALE', 'UNKNOWN', 'UNDETERMINED'))
        THEN TRUE
        ELSE FALSE
    END as parentSpeciesMismatch
FROM demographics d1
LEFT JOIN demographics d2 ON d1.Id.parents.dam = d2.Id
LEFT JOIN demographics d3 ON d1.Id.parents.sire = d3.Id
     ) d4
WHERE d4.parentSpeciesMismatch = TRUE