SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (authorize) AS authorize, (destination) AS destination, (remark) AS remark, ( CONCAT_WS(', ', 
     CASE WHEN authorize IS NULL  OR authorize=''  THEN NULL ELSE CONCAT('authorize: ', authorize)  END, 
     CASE WHEN destination IS NULL  OR destination=''  THEN NULL ELSE CONCAT('destination: ', destination)  END, 
     CASE WHEN remark IS NULL  OR remark=''  THEN NULL ELSE CONCAT('remark: ', remark)  END) ) AS Description FROM departure
