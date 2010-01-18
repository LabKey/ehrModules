SELECT id, FixDate(date) AS Date, NULL AS necropsy_objectid, (seq1) AS seq1, (seq2) AS seq2, (necropsydiag.code) AS code, snomed.meaning as description
FROM necropsydiag join snomed on necropsydiag.code =snomed.code
