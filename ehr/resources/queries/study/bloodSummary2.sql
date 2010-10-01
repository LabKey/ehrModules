SELECT
b.lsid,
w.LastWeighDate,

FROM study.blood b

LEFT JOIN study.bloodRecentWeight w
  ON (b.lsid = w.lsid)

LEFT JOIN study.weight w2
  ON (b.Id = w2.Id AND w2.date = w.LastWeighDate and w.modified = w2.modified

