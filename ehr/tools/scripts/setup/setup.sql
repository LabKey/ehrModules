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
    CASE WHEN (d IS NULL OR d = '0000-00-00') THEN
      NULL
    ELSE
      STR_TO_DATE(concat_Ws('-', case WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
      CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END ,
      CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END), '%Y-%m-%d')
    END;


DROP FUNCTION IF EXISTS FixDateTime;
CREATE FUNCTION FixDateTime(d DATE, t TIME)
    RETURNS DATETIME DETERMINISTIC
    RETURN
    CASE
      WHEN ((d IS NULL OR d = '0000-00-00') AND (t IS NULL OR t = '00:00:00')) THEN
              NULL
      WHEN (d IS NULL OR d = '0000-00-00') THEN
              STR_TO_DATE(concat_ws('d','1979-01-01',
              CASE WHEN HOUR(t)=0 OR HOUR(t)=24 THEN '00' ELSE CAST(HOUR(t) AS CHAR) END,
              CASE WHEN MINUTE(t)=0 THEN '00' ELSE CAST(MINUTE(t) AS CHAR) END,
              CASE WHEN SECOND(t)=0 THEN '00' ELSE CAST(SECOND(t) AS CHAR) END
              ), '%Y-%m-%d-%H-%i-%s')
      WHEN (t IS NULL OR t = '00:00:00' OR t = '') THEN
              STR_TO_DATE(concat_Ws('-',
              CASE WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
              CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END,
              CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END,
              '00-00-00'
              ), '%Y-%m-%d-%H-%i-%s')
      ELSE
              STR_TO_DATE(concat_Ws('-',
              CASE WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
              CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END ,
              CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END,
              CASE WHEN HOUR(t)=0 OR HOUR(t)=24 THEN '00' ELSE CAST(HOUR(t) AS CHAR) END,
              CASE WHEN MINUTE(t)=0 THEN '00' ELSE CAST(MINUTE(t) AS CHAR) END,
              CASE WHEN SECOND(t)=0 THEN '00' ELSE CAST(SECOND(t) AS CHAR) END
              ), '%Y-%m-%d-%H-%i-%s')
      END;



/*
 * Replaces '<cr><lf>' with an escaped linefeed '\n'.
 * Replaces \\ with \
 */
DROP FUNCTION IF EXISTS FixNewlines;
CREATE FUNCTION FixNewlines(t VARCHAR(4000))
    RETURNS VARCHAR(4000) DETERMINISTIC
    RETURN
    REPLACE(REPLACE(t,
        '\r\n', '\n'),
        '\\', '')
    ;

/*
 * This is ugly.  mySQL doesnt support replace using regexp
 * These are cases that have occurred.
 */
DROP FUNCTION IF EXISTS FixBadTime;
CREATE FUNCTION `FixBadTime`(t char) RETURNS time
    DETERMINISTIC
    RETURN
    CASE
            WHEN (t IS NULL OR t = '' OR t = 'pre-op') THEN NULL
    ELSE
            CAST(
            replace(replace(replace(replace(replace(replace(t,
            ';', ':'),
            'L', ''),
            '!', ''),
            'j', ''),
            '~', ''),
            '"', ':')
            AS TIME )
    END;
