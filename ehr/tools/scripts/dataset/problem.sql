/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date_observed) AS Date, (problem_no) AS problem_no, 
FixNewlines(meaning) AS Description, (date_observed) AS date_observed, (date_resolved) AS date_resolved, (c.code) AS code FROM cases c
LEFT OUTER JOIN snomed s on c.code=s.code
