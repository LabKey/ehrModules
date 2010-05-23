/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
lower(x.id) as id,
FixDate(x.date) as date,
x.account,
x.PerformedBy,
x.SpecimenType,
x.RunType,
x.SpecimenId,
x.SpecimenComment,
x.Remark,
x.ClinRemark,
x.ReqId,
x.uuid,
x.ts,
x.Description

FROM

(

SELECT
b.id,
b.date,
b.account,
null as PerformedBy,
source as SpecimenType,
'Bacteriology' as RunType,
b.uuid as SpecimenId,
null as SpecimenComment,
FixNewlines(remark) as Remark,
null as ClinRemark,
null as reqid,
b.uuid,
b.ts,
( CONCAT_WS(',\n ',
     CONCAT('Source: ', s1.meaning, ' (', source, ')'),
     CONCAT('Result: ', s2.meaning, ' (', result, ')'),
     CONCAT('Antibiotic: ', s3.meaning, ' (', antibiotic, ')'),
     CONCAT('Sensitivity: ', sensitivity),
     CONCAT('Remark: ', remark)
     ) ) AS Description
FROM bacteriology b
LEFT OUTER JOIN snomed s1 ON s1.code=b.source LEFT OUTER JOIN snomed s2 ON s2.code = b.result LEFT OUTER JOIN snomed s3 ON s3.code=b.antibiotic


UNION ALL


SELECT
c1.id,
c1.date,
null as account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Blood Chemistry' as RunType,
null as SpecimenId,
null as SpecimenComment,
null as Remark,
null as ClinRemark,
null as reqid,
c1.uuid,
c1.ts,
     ( CONCAT_WS(',\n',
     CONCAT('Test: ', name),
     CONCAT('Value: ', value)
     ) ) AS Description
FROM chemisc c1 left join chemistry c2 on c1.id=c2.id and c1.date=c2.date
where c2.id is null


UNION ALL


SELECT
c1.id,
c1.date,
null as account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Blood Chemistry' as RunType,
null as SpecimenId,
null as SpecimenComment,
null as Remark,
null as ClinRemark,
null as reqid,
c1.uuid,
c1.ts,
     ( CONCAT_WS(',\n',
     CONCAT('Test: ', name),
     CONCAT('Value: ', value, ' ', units)
     ) ) AS Description
FROM chemisc2 c1 left join chemistry c2 on c1.id=c2.id and c1.date=c2.date
where c2.id is null


UNION ALL


SELECT
id,
date,
account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Blood Chemistry' as RunType,
null as SpecimenId,
null as SpecimenComment,
remark as Remark,
clinremark as ClinRemark,
null as reqid,
uuid,
ts,
     ( CONCAT_WS(',\n',
     CONCAT('Remark: ', FixNewlines(clinremark)),
     CONCAT('Glucose: ', CAST(glucose AS CHAR)),
     CONCAT('Bun: ', CAST(bun AS CHAR)),
     CONCAT('Creatinine: ', CAST(creatinine AS CHAR)),
     CONCAT('Ck_Cpk: ', CAST(ck_cpk AS CHAR)),
     CONCAT('Uric Acid: ', CAST(uricacid AS CHAR)),
     CONCAT('Cholesterol: ', CAST(cholesterol AS CHAR)),
     CONCAT('Triglyc: ', CAST(triglyc AS CHAR)),
     CONCAT('Sgot_ast: ', CAST(sgot_ast AS CHAR)),
     CONCAT('LDH: ', CAST(ldh AS CHAR)),
     CONCAT('Tbili: ', CAST(tbili AS CHAR)),
     CONCAT('GGT: ', CAST(ggt AS CHAR)),
     CONCAT('sgpt_alt: ', CAST(sgpt_alt AS CHAR)),
     CONCAT('Total Protein: ', CAST(tprotein AS CHAR)),
     CONCAT('Albumin: ', CAST(albumin AS CHAR)),
     CONCAT('Phosphatase: ', CAST(phosphatase AS CHAR)),
     CONCAT('Calcium: ', CAST(calcium AS CHAR)),
     CONCAT('Phosphorus: ', CAST(phosphorus AS CHAR)),
     CONCAT('Iron: ', CAST(iron AS CHAR)),
     CONCAT('Sodium: ', CAST(sodium AS CHAR)),
     CONCAT('Potassium: ', CAST(potassium AS CHAR)),
     CONCAT('Chloride: ', CAST(chloride AS CHAR))
     ) ) AS Description
FROM chemistry


UNION ALL


SELECT
id,
date,
account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Hematology' as RunType,
null as SpecimenId,
null as SpecimenComment,
remark as Remark,
clinremark as ClinRemark,
null as reqid,
uuid,
ts,
     ( CONCAT_WS(',\n',
     CONCAT('WBC: ', CAST(wbc AS CHAR)),
     CONCAT('RBC: ', CAST(rbc AS CHAR)),
     CONCAT('HGB: ', CAST(hgb AS CHAR)),
     CONCAT('HCT: ', CAST(hct AS CHAR)),
     CONCAT('MCV: ', CAST(mcv AS CHAR)),
     CONCAT('MCH: ', CAST(mch AS CHAR)),
     CONCAT('MCHC: ', CAST(mchc AS CHAR)),
     CONCAT('RDW: ', CAST(rdw AS CHAR)),
     CONCAT('PLT: ', CAST(plt AS CHAR)),
     CONCAT('MPV: ', CAST(mpv AS CHAR)),
     CONCAT('PCV: ', CAST(pcv AS CHAR)),
     CONCAT('N: ', CAST(n AS CHAR)),
     CONCAT('L: ', CAST(l AS CHAR)),
     CONCAT('M: ', CAST(m AS CHAR)),
     CONCAT('E: ', CAST(e AS CHAR)),
     CONCAT('B: ', CAST(b AS CHAR)),
     CONCAT('Bands: ', CAST(bands AS CHAR)),
     CONCAT('Metamyelo: ', CAST(metamyelo AS CHAR)),
     CONCAT('Myelo: ', CAST(myelo AS CHAR)),
     CONCAT('Tprotein: ', CAST(tprotein AS CHAR)),
     CONCAT('Reticulo: ', CAST(reticulo AS CHAR)),
     CONCAT('proMyelo: ', CAST(proMyelo AS CHAR)),
     CONCAT('Blast: ', CAST(blast AS CHAR)),
     CONCAT('AtyLymph: ', CAST(atyLymph AS CHAR)),
     CONCAT('Other: ', CAST(other AS CHAR)),
     CONCAT('Remark: ', FixNewlines(clinremark))
     ) ) AS Description
FROM hematology


UNION ALL


SELECT
c1.id,
c1.date,
c1.account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Hematology' as RunType,
null as SpecimenId,
null as SpecimenComment,
null as Remark,
null as ClinRemark,
null as reqid,
c1.uuid,
c1.ts,
     ( CONCAT_WS(',\n',
     CONCAT('Morphology: ', morphology),
     CONCAT('Account: ', c2.account)
     ) ) AS Description
FROM hemamisc c1 left join hematology c2 on c1.id=c2.id and c1.date=c2.date and c1.account=c2.account
where c2.id is null


UNION ALL


SELECT
id,
date,
null as account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Lymphocyte Count' as RunType,
null as SpecimenId,
null as SpecimenComment,
null as Remark,
null as ClinRemark,
reqid as reqid,
uuid,
ts,
     ( CONCAT_WS(',\n',
     CONCAT('ReqID: ', reqid),
     CONCAT('CD3: ', CAST(cd3 AS CHAR)),
     CONCAT('CD20: ', CAST(cd20 AS CHAR)),
     CONCAT('CD4: ', CAST(cd4 AS CHAR)),
     CONCAT('CD8: ', CAST(cd8 AS CHAR))
     ) ) AS Description
FROM immunores


UNION ALL


SELECT
id,
date,
null as account,
null as PerformedBy,
't-70060' as SpecimenType,
'Urinalysis' as RunType,
uuid as SpecimenId,
appearance as SpecimenComment,
null as Remark,
FixNewlines(clincomment) AS ClinRemark,
null as reqid,
uuid,
ts,

( CONCAT_WS(',\n',
     CONCAT('Quantity: ', quantity),
     CONCAT('Collected By: ', collected_by),
     CONCAT('Method: ', method),
     CONCAT('Glucose: ', glucose),
     CONCAT('Bilirubin: ', bilirubin),
     CONCAT('Ketone: ', ketone),
     CONCAT('Sp_gravity: ', CAST(sp_gravity AS CHAR)),
     CONCAT('Blood: ', blood),
     CONCAT('pH: ', CAST(ph AS CHAR)),
     CONCAT('Protein: ', protein),
     CONCAT('Urobilinogen: ', urobilinogen),
     CONCAT('Nitrite: ', nitrite),
     CONCAT('Leucocytes: ', leucocytes),
     CONCAT('Appearance: ', appearance),
     CONCAT('Microscopic: ', microscopic)
) ) AS Description
FROM urine


UNION ALL


SELECT
id,
date,
account,
null as PerformedBy,
'Parasitology' as SpecimenType,
'Parasitology' as RunType,
null as SpecimenId,
null as SpecimenComment,
remark as Remark,
clinremark as ClinRemark,
null as reqid,
p2.uuid,
p2.ts,
     ( CONCAT_WS(',\n',
     CONCAT('Remark: ', remark),
     CONCAT('Clinremark: ', clinremark),
     group_concat(results SEPARATOR ",\n")
     ) ) AS Description
FROM
(
  select p1.id, p1.date,p1.uuid, p1.ts, room,account,remark,clinremark, CONCAT('Code: ', s1.meaning, ' (', p2.code, ')') as results
  FROM parahead p1
  LEFT JOIN parares p2 on p1.id=p2.id AND p1.date=p2.date
  LEFT JOIN snomed s1 ON s1.code=p2.code
  ) p2
GROUP BY p2.id, p2.date, account


UNION ALL


SELECT
t2.id,
t2.date,
t2.account,
null as PerformedBy,
'Virology/Isolation' as SpecimenType,
'Virology/Isolation' as RunType,
null as SpecimenId,
null as SpecimenComment,
remark as Remark,
clinremark as ClinRemark,
null as reqid,
t2.uuid,
t2.ts,
concat_ws(',\n',
     CONCAT('Suspvirus: ', t2.suspvirus),
     CONCAT('Remark: ', t2.remark),
     CONCAT('Clin Remark: ', t2.clinremark),
     group_concat(t2.results SEPARATOR ',\n')
     ) AS Description
FROM
(
  select p1.id, p1.date,suspvirus,account,remark,p1.uuid,p1.ts,clinremark, CONCAT('Source: ', p2.source, '\n', 'Result: ', p2.result, ')') as results
  FROM virisohead p1
  LEFT JOIN virisores p2 on p1.id=p2.id AND p1.date=p2.date
  WHERE result IS NOT NULL GROUP BY p2.id, p2.date, p2.seq, p2.source, p2.result
  ) t2
GROUP BY t2.id, t2.date, t2.account, t2.suspvirus


UNION ALL


SELECT
t2.id,
t2.date,
t2.account,
null as PerformedBy,
't-c2000' as SpecimenType,
'Virology/Serology' as RunType,
null as SpecimenId,
null as SpecimenComment,
remark as Remark,
clinremark as ClinRemark,
null as reqid,
t2.uuid,
t2.ts,
concat_ws(',\n',
     CONCAT('Remark: ', t2.remark),
     CONCAT('Clin Remark: ', t2.clinremark),
     group_concat(t2.results SEPARATOR ',\n')
     ) AS Description
FROM
(
  select p1.id, p1.date,virus,p1.uuid,p1.ts,account,remark,clinremark, CONCAT('Virus: ', p2.virus, '\n', 'Result: ', p2.result, ')') as results
  FROM virserohead p1
  LEFT JOIN virserores p2 on p1.id=p2.id AND p1.date=p2.date
  WHERE result IS NOT NULL GROUP BY p2.id, p2.date, p2.seq, p2.virus, p2.result
  ) t2
GROUP BY t2.id, t2.date, t2.account


) x


WHERE id != '' and date != '0000-00-00' AND date IS NOT NULL