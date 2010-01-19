/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (f.code) AS code, (amount) AS amount, (units) AS units, (route) AS route, 
timestamp(Date('1970-01-01'), begintime) AS begintime, timestamp(Date('1970-01-01'), endtime)  AS endtime, 
( CONCAT_WS(', ', 
     CASE WHEN f.code IS NULL  OR f.code=''  THEN NULL ELSE meaning  END, 
     CASE WHEN amount IS NULL  THEN NULL ELSE CONCAT('amount: ', CAST(amount AS CHAR))  END, 
     CASE WHEN units IS NULL  OR units=''  THEN NULL ELSE units  END, 
     CASE WHEN route IS NULL  OR route=''  THEN NULL ELSE route  END, 
     CASE WHEN begintime IS NULL  OR begintime=''  THEN NULL ELSE CONCAT('begintime: ', begintime)  END, 
     CASE WHEN endtime IS NULL  OR endtime=''  THEN NULL ELSE CONCAT('endtime: ', endtime)  END) ) AS Description FROM surgfluid f
     LEFT OUTER JOIN snomed s on s.code=f.code
