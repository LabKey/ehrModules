/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.Properties.Id,
  v.Properties.SampleDate as date,

  CASE
    WHEN (v.Properties.ViralLoad < 50)
      THEN 50
    else
      v.Properties.ViralLoad
    END
   as ViralLoad,

  round(
  CASE
    WHEN (v.Properties.ViralLoad < 50)
      THEN log10(50)
    else
      log10(v.Properties.ViralLoad)
    END, 1)
   as LogVL

FROM "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VL_DB/".assay."Viral_Load Data" v

--TODO
--WHERE v.qcstate.publicdata = true

