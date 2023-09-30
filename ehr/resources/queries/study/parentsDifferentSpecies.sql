SELECT *
FROM (
SELECT
    d1.Id,
    d1.gender,
    d1.species,
    d2.Id as damId,
    d2.species as damSpecies,
    d3.Id as sireId,
    d3.species as sireSpecies,
    CASE WHEN (d2.species IS NOT NULL AND d1.species != d2.species) AND
              (d3.species IS NOT NULL AND d1.species != d3.species)
        THEN TRUE
        ELSE FALSE
    END as parentSpeciesMismatch
FROM demographics d1
LEFT JOIN demographics d2 ON d1.dam = d2.Id
LEFT JOIN demographics d3 ON d1.sire = d3.Id
) d4
WHERE d4.parentSpeciesMismatch = TRUE