SELECT *
FROM (
      SELECT
          dem.Id,
          dem.gender,
          dem.species,
          dem.birth,
          dem.dam,
          damDem.birth as damBirth,
          dem.sire,
          sireDem.birth as sireBirth
      FROM demographics dem
      LEFT JOIN demographics damDem ON dem.dam = damDem.Id
      LEFT JOIN demographics sireDem ON dem.sire = sireDem.Id
  ) t
WHERE (t.birth <= t.damBirth OR t.birth <= t.sireBirth)