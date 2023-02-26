SELECT t.Id as Parent, GROUP_CONCAT(t.DamChildren, ',') as DamChildren, GROUP_CONCAT(t.SireChildren, ',') as SireChildren FROM
(

SELECT d.Id, d.DamChildren, s.SireChildren FROM (

SELECT Id as DamChildren,
dam as Id
FROM demographics
WHERE dam IN (
SELECT Distinct dam as Id 
FROM demographics
WHERE dam IN (SELECT Distinct sire FROM demographics))
) d   

JOIN

(SELECT * FROM (

SELECT Id as SireChildren,
sire as Id
FROM demographics
WHERE sire IN (
SELECT Distinct dam as Id 
FROM demographics
WHERE dam IN (SELECT Distinct sire FROM demographics))
) si ) s   
   
ON s.Id = d.Id   
) t
GROUP BY t.Id