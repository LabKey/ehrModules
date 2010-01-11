SELECT id, FixDate(date) AS Date, (seq1) AS seq1, (seq2) AS seq2, (code) AS code, null AS biopsy_objectid, ( CONCAT_WS(', ', 
     CASE WHEN seq1 IS NULL  THEN NULL ELSE CONCAT('seq1: ', CAST(seq1 AS CHAR))  END, 
     CASE WHEN seq2 IS NULL  THEN NULL ELSE CONCAT('seq2: ', CAST(seq2 AS CHAR))  END, 
     CASE WHEN code IS NULL  OR code=''  THEN NULL ELSE CONCAT('code: ', code)  END) ) AS Description FROM biopsydiag
