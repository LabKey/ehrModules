SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (code) AS code FROM surgproc
