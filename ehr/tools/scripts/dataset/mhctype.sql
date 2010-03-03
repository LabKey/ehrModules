/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, CurDate() AS Date, (a01) AS a01, (a02) AS a02, (b08) AS b08, (b17) AS b17, ( CONCAT_WS(', ', 
     CASE WHEN a01 IS NULL  OR a01=''  THEN NULL ELSE CONCAT('A01: ', a01)  END,
     CASE WHEN a02 IS NULL  OR a02=''  THEN NULL ELSE CONCAT('A02: ', a02)  END,
     CASE WHEN b08 IS NULL  OR b08=''  THEN NULL ELSE CONCAT('B08: ', b08)  END,
     CASE WHEN b17 IS NULL  OR b17=''  THEN NULL ELSE CONCAT('B17: ', b17)  END) ) AS Description
FROM mhctype
WHERE id IS NOT NULL AND id != ''
