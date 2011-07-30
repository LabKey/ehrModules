select * from ehr_lookups.cage c
where
(c.length > 50 OR c.width > 50)
and c.cage not like '%pen%'