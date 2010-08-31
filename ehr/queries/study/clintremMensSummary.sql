/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.id,
  d.year,
  d.monthName,
  d.monthNum,
  d.date,

  CASE d.day
    WHEN 1 THEN 'X'
    ELSE null
  END as "1",

  CASE d.day
    WHEN 2 THEN 'X'
    ELSE null
  END as "2",

  CASE d.day
    WHEN 3 THEN 'X'
    ELSE null
  END as "3",

  CASE d.day
    WHEN 4 THEN 'X'
    ELSE null
  END as "4",

  CASE d.day
    WHEN 5 THEN 'X'
    ELSE null
  END as "5",

  CASE d.day
    WHEN 6 THEN 'X'
    ELSE null
  END as "6",

  CASE d.day
    WHEN 7 THEN 'X'
    ELSE null
  END as "7",

  CASE d.day
    WHEN 8 THEN 'X'
    ELSE null
  END as "8",

  CASE d.day
    WHEN 9 THEN 'X'
    ELSE null
  END as "9",

  CASE d.day
    WHEN 10 THEN 'X'
    ELSE null
  END as "10",

  CASE d.day
    WHEN 11 THEN 'X'
    ELSE null
  END as "11",

  CASE d.day
    WHEN 12 THEN 'X'
    ELSE null
  END as "12",

  CASE d.day
    WHEN 13 THEN 'X'
    ELSE null
  END as "13",

  CASE d.day
    WHEN 14 THEN 'X'
    ELSE null
  END as "14",

  CASE d.day
    WHEN 15 THEN 'X'
    ELSE null
  END as "15",

  CASE d.day
    WHEN 16 THEN 'X'
    ELSE null
  END as "16",

  CASE d.day
    WHEN 17 THEN 'X'
    ELSE null
  END as "17",

  CASE d.day
    WHEN 18 THEN 'X'
    ELSE null
  END as "18",

  CASE d.day
    WHEN 19 THEN 'X'
    ELSE null
  END as "19",

  CASE d.day
    WHEN 20 THEN 'X'
    ELSE null
  END as "20",

  CASE d.day
    WHEN 21 THEN 'X'
    ELSE null
  END as "21",

  CASE d.day
    WHEN 22 THEN 'X'
    ELSE null
  END as "22",

  CASE d.day
    WHEN 23 THEN 'X'
    ELSE null
  END as "23",

  CASE d.day
    WHEN 24 THEN 'X'
    ELSE null
  END as "24",

  CASE d.day
    WHEN 25 THEN 'X'
    ELSE null
  END as "25",

  CASE d.day
    WHEN 26 THEN 'X'
    ELSE null
  END as "26",

  CASE d.day
    WHEN 27 THEN 'X'
    ELSE null
  END as "27",

  CASE d.day
    WHEN 28 THEN 'X'
    ELSE null
  END as "28",

  CASE d.day
    WHEN 29 THEN 'X'
    ELSE null
  END as "29",

  CASE d.day
    WHEN 30 THEN 'X'
    ELSE null
  END as "30",

  CASE d.day
    WHEN 31 THEN 'X'
    ELSE null
  END as "31",

FROM study.clintremMens d


