/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

b.id,
b.date,
max(b.GLUC) as GLUC,
max(b.BUN) as BUN,
max(b.CREAT) as CREAT,
max(b.CPK) as CPK,
max(b.CHOL) as CHOL,
max(b.TRIG) as TRIG,
max(b.SGOT) as SGOT,
max(b.LDH) as LDH,
max(b.TB) as TB,
max(b.GGT) as GGT,
max(b.SGPT) as SGPT,
max(b.TP) as TP,
max(b.ALB) as ALB,
max(b.ALKP) as ALKP,
max(b.CA) as CA,
max(b.PHOS) as PHOS,
max(b.FE) as FE,
max(b.NA) as NA,
max(b.K) as K,
max(b.CL) as CL,
max(b.UA) as UA

FROM (

SELECT

b.id,
b.date,
b.runId,

CASE WHEN b.testid='GLUC'
  THEN b.result
  ELSE null
END as GLUC,

CASE WHEN b.testid='BUN'
  THEN b.result
  ELSE null
END as BUN,

CASE WHEN b.testid='CREAT'
  THEN b.result
  ELSE null
END as CREAT,

CASE WHEN b.testid='CPK'
  THEN b.result
  ELSE null
END as CPK,

CASE WHEN b.testid='UA'
  THEN b.result
  ELSE null
END as UA,

CASE WHEN b.testid='CHOL'
  THEN b.result
  ELSE null
END as CHOL,

CASE WHEN b.testid='TRIG'
  THEN b.result
  ELSE null
END as TRIG,

CASE WHEN b.testid='SGOT'
  THEN b.result
  ELSE null
END as SGOT,

CASE WHEN b.testid='LDH'
  THEN b.result
  ELSE null
END as LDH,

CASE WHEN b.testid='TB'
  THEN b.result
  ELSE null
END as TB,

CASE WHEN b.testid='GGT'
  THEN b.result
  ELSE null
END as GGT,

CASE WHEN b.testid='SGPT'
  THEN b.result
  ELSE null
END as SGPT,

CASE WHEN b.testid='TP'
  THEN b.result
  ELSE null
END as TP,

CASE WHEN b.testid='ALB'
  THEN b.result
  ELSE null
END as ALB,

CASE WHEN b.testid='ALKP'
  THEN b.result
  ELSE null
END as ALKP,

CASE WHEN b.testid='CA'
  THEN b.result
  ELSE null
END as CA,

CASE WHEN b.testid='PHOS'
  THEN b.result
  ELSE null
END as PHOS,

CASE WHEN b.testid='FE'
  THEN b.result
  ELSE null
END as FE,

CASE WHEN b.testid='NA'
  THEN b.result
  ELSE null
END as NA,

CASE WHEN b.testid='K'
  THEN b.result
  ELSE null
END as K,

CASE WHEN b.testid='CL'
  THEN b.result
  ELSE null
END as CL

FROM study."Blood Chemistry Results" b
WHERE b.qcstate.publicdata = true

) b

GROUP BY b.id, b.date, b.runId