SELECT id, FixDate(adate) AS Date, (pno) AS pno, (rdate) AS rdate, ( CONCAT_WS(', ', 
    CONCAT('adate: ', CAST(adate AS CHAR))  , 
     CASE WHEN rdate IS NULL  THEN NULL ELSE CONCAT('rdate: ', CAST(rdate AS CHAR))  END) ) AS Description FROM assignment
