SELECT * FROM (
SELECT d1.Id,
d1.Dataset.Demographics.gender,
d1.Dataset.Demographics.species,
d1.Parents.dam,
d1.Parents.dam.Demographics.species as damSpecies,
d1.Parents.sire,
d1.Parents.sire.Demographics.species as sireSpecies,
CASE WHEN (d1.Parents.dam.Demographics.species IS NOT NULL AND d1.Parents.dam.Demographics.species != d1.Dataset.Demographics.species) OR (d1.Parents.sire.Demographics.species IS NOT NULL AND d1.Parents.sire.Demographics.species != d1.Dataset.Demographics.species)
THEN TRUE
ELSE FALSE
END as parentSpeciesMismatch
FROM study.Animal d1
) d2
WHERE d2.parentSpeciesMismatch = TRUE
