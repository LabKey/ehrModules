/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query provides an overview of the MHC SSP results
SELECT
  m.Id,
  --m.Institution AS Institution,
  COALESCE(m.PrimerPair.ShortName, m.PrimerPair.Allele) AS ShortName,
  m.PrimerPair.Allele AS Alleles,
  --m.PrimerPair,

  COALESCE(max(m.ReportDate), '1990-01-01') as Date,
  count(*) as TotalRecords,

  CASE
    WHEN sum(m.Result)=0
      THEN 'NEG'
    WHEN sum(m.Result)=(count(*))
      THEN 'POS'
    ELSE 'DISCREPANCY'
  END
  AS Status

FROM "/WNPRC/WNPRC_Units/Research_Services/MHC_SSP/Private/MHC_DB/".assay."MHC_SSP Data" m

WHERE (m.Institution='Wisconsin NPRC' or m.Institution='Harlow')

GROUP BY m.Id, m.PrimerPair.Allele, m.PrimerPair.ShortName