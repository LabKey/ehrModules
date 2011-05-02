/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,

(d2.room || '-' || d2.cage) AS Location,

d2.room,

d2.cage,

  CASE
    WHEN d2.room like 'ab10%' THEN 'SPF'
    WHEN d2.room like 'ab11%' THEN 'SPF'
    WHEN d2.room like 'ab12%' THEN 'SPF'
    WHEN d2.room like 'ab14%' THEN 'NSPF'
    WHEN d2.room like 'ab16%' THEN 'NSPF'
    WHEN d2.room like 'a1%' THEN 'A1/AB190'
    WHEN d2.room like 'ab190%' THEN 'A1/AB190'
    WHEN d2.room like 'a2%' THEN 'A2'
    WHEN d2.room like 'cb%' THEN 'CB'
    WHEN d2.room like 'c3%' THEN 'C3'
    WHEN d2.room like 'c4%' THEN 'C4'
    WHEN d2.room like 'cif%' THEN 'Charmany'
    WHEN d2.room like 'mr%' THEN 'WIMR'
    ELSE null
  END as area,

d2.cond

FROM study.Demographics d

LEFT JOIN study.housing d2
  ON (d.Id = d2.Id AND d2.enddate IS NULL)

WHERE d.death IS NULL AND (d.departdate IS NULL OR d.departdate < d.arrivedate)
 AND d2.qcstate.publicdata = true