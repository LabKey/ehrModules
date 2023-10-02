SELECT *
FROM (
      SELECT
          dem.Id,
          dem.gender,
          dem.species,
          dem.birth,
          dem.Id.parents.dam,
          damDem.birth as damBirth,
          dem.Id.parents.sire,
          sireDem.birth as sireBirth
      FROM demographics dem
      LEFT JOIN demographics damDem ON dem.Id.parents.dam = damDem.Id
      LEFT JOIN demographics sireDem ON dem.Id.parents.sire = sireDem.Id
  ) t
WHERE (t.birth <= t.damBirth OR t.birth <= t.sireBirth)