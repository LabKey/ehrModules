SELECT id, FixDate(date) AS Date, (reqid) AS reqid, (cd3) AS cd3, (cd20) AS cd20, (cd4) AS cd4, (cd8) AS cd8, ( CONCAT_WS(', ', 
     CASE WHEN reqid IS NULL  OR reqid=''  THEN NULL ELSE CONCAT('reqid: ', reqid)  END, 
     CASE WHEN cd3 IS NULL  THEN NULL ELSE CONCAT('cd3: ', CAST(cd3 AS CHAR))  END, 
     CASE WHEN cd20 IS NULL  THEN NULL ELSE CONCAT('cd20: ', CAST(cd20 AS CHAR))  END, 
     CASE WHEN cd4 IS NULL  THEN NULL ELSE CONCAT('cd4: ', CAST(cd4 AS CHAR))  END, 
     CASE WHEN cd8 IS NULL  THEN NULL ELSE CONCAT('cd8: ', CAST(cd8 AS CHAR))  END) ) AS Description FROM immunores
