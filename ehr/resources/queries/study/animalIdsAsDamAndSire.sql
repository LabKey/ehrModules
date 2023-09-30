
SELECT DISTINCT dam AS Id,
                gender,
                species
FROM demographics
WHERE dam IN (SELECT sire FROM demographics)

UNION

SELECT DISTINCT sire AS Id,
                gender,
                species
FROM demographics
WHERE sire IN (SELECT dam FROM demographics);
