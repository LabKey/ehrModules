SELECT id, FixDate(date_observed) AS Date, (problem_no) AS problem_no, 
(meaning) AS Description, (date_observed) AS date_observed, (date_resolved) AS date_resolved, (c.code) AS code FROM cases c
LEFT OUTER JOIN snomed s on c.code=s.code
