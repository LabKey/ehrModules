SELECT
n.Id,
n.date,
n.seq1,
n.caseno.caseno,
group_concat(n.tissue.meaning) as tissue,
group_concat(n.severity.meaning) as severity,
group_concat(n.duration.meaning) as duration,
group_concat(n.distribution.meaning) as distribution,
group_concat(n.process.meaning) as process,
FROM "Morphologic Diagnosis" n
group by n.id, n.date, n.seq1, n.caseno.caseno