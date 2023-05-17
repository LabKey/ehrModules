SELECT * FROM (
SELECT d1.Id,
d1.Dataset.Demographics.gender,
d1.Dataset.Demographics.species,
d1.Parents.dam,
d1.Parents.dam.Demographics.gender as damSex,
d1.Parents.sire,
d1.Parents.sire.Demographics.gender as sireSex,
CASE WHEN (d1.Parents.dam.Demographics.gender.code IS NOT NULL AND d1.Parents.dam.Demographics.gender.code != 'f') OR (d1.Parents.sire.Demographics.gender.code IS NOT NULL AND d1.Parents.sire.Demographics.gender.code != 'm')
THEN TRUE
ELSE FALSE
END as parentSexMismatch
FROM study.Animal d1
) d2
WHERE d2.parentSexMismatch = TRUE
