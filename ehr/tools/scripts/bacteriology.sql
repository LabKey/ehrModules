SELECT id, FixDate(date) AS Date, (account) AS account, (source) AS source, (result) AS result, (remark) AS remark, (antibiotic) AS antibiotic, (sensitivity) AS sensitivity, 
( CONCAT_WS(', ', 
     CASE WHEN source IS NULL  OR source=''  THEN NULL ELSE CONCAT('source: ', s1.meaning, ' (', source, ')') END, 
     CASE WHEN result=''  THEN NULL ELSE CONCAT('result: ', s2.meaning, ' (', result, ')')  END, 
     CASE WHEN remark IS NULL  OR remark=''  THEN NULL ELSE CONCAT('remark: ', remark) END, 
     CASE WHEN antibiotic IS NULL  OR antibiotic=''  THEN NULL ELSE CONCAT('antibiotic: ', s3.meaning, ' (', antibiotic, ')') END, 
     CASE WHEN sensitivity IS NULL  OR sensitivity=''  THEN NULL ELSE CONCAT('sensitivity: ', sensitivity) END) ) AS Description FROM colony.bacteriology b
     LEFT OUTER JOIN colony.snomed s1 ON s1.code=b.source LEFT OUTER JOIN colony.snomed s2 ON s2.code = b.result LEFT OUTER JOIN colony.snomed s3 ON s3.code=b.antibiotic
     
