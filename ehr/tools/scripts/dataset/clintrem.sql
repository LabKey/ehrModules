SELECT id, FixDate(date) AS Date, (pno) AS pno, Timestamp(Date('1970-01-01'), time) AS time, (remark) AS description, (userid) AS userid FROM clintrem
