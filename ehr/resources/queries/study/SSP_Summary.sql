/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query provides an overview of the MHC SSP results
SELECT
  m.Properties.Id,
  --m.Properties.Institution AS Institution,
  COALESCE(m.Properties.PrimerPair.ShortName, m.Properties.PrimerPair.Allele) AS ShortName,
  m.Properties.PrimerPair.Allele AS Alleles,


  COALESCE(max(m.Properties.ReportDate), '1990-01-01') as Date,
  count(*) as TotalRecords,
  
  CASE
    WHEN sum(m.Properties.Result)=0
      THEN 'NEG'
    WHEN sum(m.Properties.Result)=(count(*))
      THEN 'POS'
    ELSE 'DISCREPANCY'
  END
  AS Status

FROM "/WNPRC/WNPRC_Units/Research_Services/MHC_SSP/Private/MHC_DB/".assay."MHC_SSP Data" m

WHERE (m.Properties.Institution='Wisconsin NPRC' or m.Properties.Institution='Harlow')

GROUP BY m.Properties.Id, m.Properties.PrimerPair.Allele, m.Properties.PrimerPair.ShortName