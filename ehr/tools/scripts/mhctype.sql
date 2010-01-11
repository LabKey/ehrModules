SELECT id, CurDate() AS Date, (a01) AS a01, (a02) AS a02, (b08) AS b08, (b17) AS b17, ( CONCAT_WS(', ', 
     CASE WHEN a01 IS NULL  OR a01=''  THEN NULL ELSE CONCAT('a01: ', a01)  END, 
     CASE WHEN a02 IS NULL  OR a02=''  THEN NULL ELSE CONCAT('a02: ', a02)  END, 
     CASE WHEN b08 IS NULL  OR b08=''  THEN NULL ELSE CONCAT('b08: ', b08)  END, 
     CASE WHEN b17 IS NULL  OR b17=''  THEN NULL ELSE CONCAT('b17: ', b17)  END) ) AS Description FROM mhctype
