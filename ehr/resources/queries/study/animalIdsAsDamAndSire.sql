
SELECT DISTINCT Id.parents.dam AS Id,
                gender,
                species
FROM demographics
WHERE Id.parents.dam IN (SELECT Id.parents.sire FROM demographics)

UNION

SELECT DISTINCT Id.parents.sire AS Id,
                gender,
                species
FROM demographics
WHERE Id.parents.sire IN (SELECT Id.parents.dam FROM demographics);
