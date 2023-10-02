
SELECT Id.parents.dam AS parent,
       gender,
       species
FROM demographics
WHERE Id.parents.dam IN (SELECT Id.parents.sire FROM demographics)
