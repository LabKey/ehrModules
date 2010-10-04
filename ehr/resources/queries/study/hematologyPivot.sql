SELECT

h.id,
h.date,
max(h.WBC) as WBC,
max(h.RBC) as RBC,
max(h.HGB) as HGB,
max(h.HCT) as HCT,
max(h.MCV) as MCV,
max(h.MCH) as MCH,
max(h.MCHC) as MCHC,
max(h.RDW) as RDW,
max(h.PLT) as PLT,
max(h.MPV) as SGPT,
max(h.PCV) as PCV,
max(h.NE) as NE,
max(h.LY) as LY,
max(h.MN) as MN,
max(h.EO) as EO,
max(h.BS) as BS,
max(h.BANDS) as BANDS,
max(h.METAMYELO) as METAMYELO,
max(h.MYELO) as MYELO,
max(h.TP) as TP,
max(h.RETICULO) as RETICULO


FROM (

SELECT

h.id,
h.date,
h.runId,

CASE WHEN h.testid='WBC'
  THEN h.result
  ELSE null
END as WBC,

CASE WHEN h.testid='RBC'
  THEN h.result
  ELSE null
END as RBC,

CASE WHEN h.testid='HGB'
  THEN h.result
  ELSE null
END as HGB,

CASE WHEN h.testid='HCT'
  THEN h.result
  ELSE null
END as HCT,

CASE WHEN h.testid='MCV'
  THEN h.result
  ELSE null
END as MCV,

CASE WHEN h.testid='MCH'
  THEN h.result
  ELSE null
END as MCH,

CASE WHEN h.testid='MCHC'
  THEN h.result
  ELSE null
END as MCHC,

CASE WHEN h.testid='RDW'
  THEN h.result
  ELSE null
END as RDW,

CASE WHEN h.testid='PLT'
  THEN h.result
  ELSE null
END as PLT,

CASE WHEN h.testid='MPV'
  THEN h.result
  ELSE null
END as MPV,

CASE WHEN h.testid='PCV'
  THEN h.result
  ELSE null
END as PCV,

CASE WHEN h.testid='NE'
  THEN h.result
  ELSE null
END as NE,

CASE WHEN h.testid='LY'
  THEN h.result
  ELSE null
END as LY,

CASE WHEN h.testid='MN'
  THEN h.result
  ELSE null
END as MN,

CASE WHEN h.testid='EO'
  THEN h.result
  ELSE null
END as EO,

CASE WHEN h.testid='BS'
  THEN h.result
  ELSE null
END as BS,

CASE WHEN h.testid='BANDS'
  THEN h.result
  ELSE null
END as BANDS,

CASE WHEN h.testid='METAMYELO'
  THEN h.result
  ELSE null
END as METAMYELO,

CASE WHEN h.testid='MYELO'
  THEN h.result
  ELSE null
END as MYELO,

CASE WHEN h.testid='TP'
  THEN h.result
  ELSE null
END as TP,

CASE WHEN h.testid='RETICULO'
  THEN h.result
  ELSE null
END as RETICULO,

FROM study."Hematology Results" h

) h

GROUP BY h.id, h.date, h.runId