SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (source) AS source, (remark) AS remark, ( CONCAT_WS(', ', 
     CASE WHEN source IS NULL  OR source=''  THEN NULL ELSE CONCAT('source: ', source)  END, 
     CASE WHEN remark IS NULL  OR remark=''  THEN NULL ELSE CONCAT('remark: ', remark)  END) ) AS Description FROM arrival
