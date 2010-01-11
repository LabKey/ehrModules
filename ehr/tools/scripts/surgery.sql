SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (age) AS age, (inves) AS inves, (pno) AS pno, 
(surgeon) AS surgeon, 
(enddate) AS enddate, (endtime) AS endtime, (major) AS major, (remark) AS description 
FROM surghead
