/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (quantity) AS quantity, (done_by) AS done_by, (done_for) AS done_for, (pno) AS pno, (p_s) AS p_s, (a_v) AS a_v, (code) AS code, (caretaker) AS caretaker, (tube_type) AS tube_type, ( CONCAT_WS(', ', 
     CASE WHEN quantity IS NULL  THEN NULL ELSE CONCAT('quantity: ', CAST(quantity AS CHAR))  END, 
     CASE WHEN done_by IS NULL  OR done_by=''  THEN NULL ELSE CONCAT('done_by: ', done_by)  END, 
     CASE WHEN done_for IS NULL  OR done_for=''  THEN NULL ELSE CONCAT('done_for: ', done_for)  END, 
     CASE WHEN p_s IS NULL  OR p_s=''  THEN NULL ELSE CONCAT('p_s: ', p_s)  END, 
     CASE WHEN a_v IS NULL  OR a_v=''  THEN NULL ELSE CONCAT('a_v: ', a_v)  END, 
     CASE WHEN code IS NULL  OR code=''  THEN NULL ELSE CONCAT('code: ', code)  END, 
     CASE WHEN caretaker IS NULL  OR caretaker=''  THEN NULL ELSE CONCAT('caretaker: ', caretaker)  END, 
     CASE WHEN tube_type IS NULL  OR tube_type=''  THEN NULL ELSE CONCAT('tube_type: ', tube_type)  END, 
     CASE WHEN verified IS NULL  THEN NULL ELSE CONCAT('verified: ', CAST(verified AS CHAR))  END) ) AS Description FROM blood
