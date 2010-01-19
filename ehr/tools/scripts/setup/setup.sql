/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
USE colony;
DROP FUNCTION IF EXISTS FixDate;
CREATE FUNCTION FixDate(d DATE)
    RETURNS DATE DETERMINISTIC
    RETURN 
    CASE WHEN d IS NULL THEN NULL ELSE
    STR_TO_DATE(concat_Ws('-', case WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
    CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END ,
    CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END), '%Y-%m-%d') END;