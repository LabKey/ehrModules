/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
lower(id) as id,
date,
TestID, /*TestName - omitted.  should be a lookup */
QuantitativeResults,
QuantitativeUnits,
ResultComment,
CannedMessage,
Interpretation,
ClinRemark,
SampleId,
OrgName, /* OrgAbbrev  - omitted.  should be a lookup */
IsoQnt,
IsolateComment,
DrugName,
BloodInt,
MRN,  /* proxy for parentId. MRN = medical record number.  either imported off meriter or auto generated  */
uuid,
ts
FROM

(

SELECT
id,
date,
name as TestID,
value as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
COALESCE((select max(UUID) FROM chemistry t2 WHERE t1.id=t2.id and t1.date=t2.date), uuid) as MRN,
uuid, ts
FROM chemisc t1

UNION ALL

SELECT
id,
date,
name as TestID,
value as QuantitativeResults,
units as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
COALESCE((select max(UUID) FROM chemistry t2 WHERE t1.id=t2.id and t1.date=t2.date), uuid) as MRN,
uuid, ts
FROM chemisc2 t1

UNION ALL

SELECT
id,
date,
'Glucose' as TestID,
glucose as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where glucose is not null and glucose != ""

UNION ALL

SELECT
id,
date,
'bun' as TestID,
bun as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where bun is not null and bun != ""

UNION ALL

SELECT
id,
date,
'creatinine' as TestID,
creatinine as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where creatinine is not null and creatinine != ""

UNION ALL

SELECT
id,
date,
'ck_cpk' as TestID,
ck_cpk as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where ck_cpk is not null and ck_cpk != ""

UNION ALL

SELECT
id,
date,
'uricacid' as TestID,
uricacid as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where uricacid is not null and uricacid != ""

UNION ALL

SELECT
id,
date,
'cholesterol' as TestID,
cholesterol as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where cholesterol is not null and cholesterol != ""

UNION ALL

SELECT
id,
date,
'triglyc' as TestID,
triglyc as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where triglyc is not null and triglyc != ""

UNION ALL

SELECT
id,
date,
'sgot_ast' as TestID,
sgot_ast as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where sgot_ast is not null and sgot_ast != ""

UNION ALL

SELECT
id,
date,
'tbili' as TestID,
tbili as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where tbili is not null and tbili != ""

UNION ALL

SELECT
id,
date,
'ggt' as TestID,
ggt as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where ggt is not null and ggt != ""

UNION ALL

SELECT
id,
date,
'sgpt_alt' as TestID,
sgpt_alt as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where sgpt_alt is not null and sgpt_alt != ""

UNION ALL

SELECT
id,
date,
'tprotein' as TestID,
tprotein as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where tprotein is not null and tprotein != ""

UNION ALL

SELECT
id,
date,
'albumin' as TestID,
albumin as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where albumin is not null and albumin != ""

UNION ALL

SELECT
id,
date,
'phosphatase' as TestID,
phosphatase as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where phosphatase is not null and phosphatase != ""

UNION ALL

SELECT
id,
date,
'calcium' as TestID,
calcium as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where calcium is not null and calcium != ""

UNION ALL

SELECT
id,
date,
'phosphorus' as TestID,
phosphorus as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where phosphorus is not null and phosphorus != ""

UNION ALL

SELECT
id,
date,
'iron' as TestID,
iron as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where iron is not null and iron != ""

UNION ALL

SELECT
id,
date,
'sodium' as TestID,
sodium as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where sodium is not null and sodium != ""

UNION ALL

SELECT
id,
date,
'potassium' as TestID,
potassium as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where potassium is not null and potassium != ""

UNION ALL

SELECT
id,
date,
'chloride' as TestID,
chloride as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM chemistry
where chloride is not null and chloride != ""

UNION ALL

SELECT
id,
date,
'Morphology' as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
morphology as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
(select max(UUID) FROM hematology t2 WHERE t1.id=t2.id and t1.date=t2.date AND t1.account=t2.account) as MRN,
uuid, ts
FROM hemamisc t1

UNION ALL

SELECT
id,
date,
'wbc' as TestID,
wbc as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where wbc is not null and wbc != ""

UNION ALL

SELECT
id,
date,
'rbc' as TestID,
rbc as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where rbc is not null and rbc != ""

UNION ALL

SELECT
id,
date,
'hgb' as TestID,
hgb as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where hgb is not null and hgb != ""

UNION ALL

SELECT
id,
date,
'hct' as TestID,
hct as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where hct is not null and hct != ""

UNION ALL

SELECT
id,
date,
'mcv' as TestID,
mcv as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where mcv is not null and mcv != ""

UNION ALL

SELECT
id,
date,
'mch' as TestID,
mch as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where mch is not null and mch != ""

UNION ALL

SELECT
id,
date,
'mchc' as TestID,
mchc as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where mchc is not null and mchc != ""

UNION ALL

SELECT
id,
date,
'rdw' as TestID,
rdw as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where rdw is not null and rdw != ""

UNION ALL

SELECT
id,
date,
'plt' as TestID,
plt as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where plt is not null and plt != ""

UNION ALL

SELECT
id,
date,
'mpv' as TestID,
mpv as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where mpv is not null and mpv != ""

UNION ALL

SELECT
id,
date,
'pcv' as TestID,
pcv as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where pcv is not null and pcv != ""

UNION ALL

SELECT
id,
date,
'n' as TestID,
n as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where n is not null and n != ""

UNION ALL

SELECT
id,
date,
'l' as TestID,
l as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where l is not null and l != ""

UNION ALL

SELECT
id,
date,
'm' as TestID,
m as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where m is not null and m != ""

UNION ALL

SELECT
id,
date,
'e' as TestID,
e as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where e is not null and e != ""

UNION ALL

SELECT
id,
date,
'b' as TestID,
b as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where b is not null and b != ""

UNION ALL

SELECT
id,
date,
'bands' as TestID,
bands as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where bands is not null and bands != ""

UNION ALL

SELECT
id,
date,
'metamyelo' as TestID,
metamyelo as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where metamyelo is not null and metamyelo != ""

UNION ALL

SELECT
id,
date,
'myelo' as TestID,
myelo as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where myelo is not null and myelo != ""

UNION ALL

SELECT
id,
date,
'tprotein' as TestID,
tprotein as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where tprotein is not null and tprotein != ""

UNION ALL

SELECT
id,
date,
'reticulo' as TestID,
reticulo as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where reticulo is not null and reticulo != ""

UNION ALL

SELECT
id,
date,
'proMyelo' as TestID,
proMyelo as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where proMyelo is not null and proMyelo != ""

UNION ALL

SELECT
id,
date,
'blast' as TestID,
blast as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where blast is not null and blast != ""

UNION ALL

SELECT
id,
date,
'AtyLymph' as TestID,
AtyLymph as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where AtyLymph is not null and AtyLymph != ""

UNION ALL

SELECT
id,
date,
'other' as TestID,
other as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
null as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM hematology
where other is not null and other != ""

UNION ALL

SELECT
id,
date,
'CXSUP' as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM bacteriology

UNION ALL

SELECT
id,
date,
'CD3' as TestID,
cd3 as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM immunores

UNION ALL

SELECT
id,
date,
'CD20' as TestID,
cd20 as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM immunores

UNION ALL

SELECT
id,
date,
'CD4' as TestID,
cd4 as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM immunores

UNION ALL

SELECT
id,
date,
'CD8' as TestID,
cd8 as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM immunores

UNION ALL

SELECT
id,
date,
'glucose' as TestID,
glucose as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'bilirubin' as TestID,
bilirubin as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL


SELECT
id,
date,
'ketone' as TestID,
ketone as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL


SELECT
id,
date,
'sp_gravity' as TestID,
sp_gravity as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'blood' as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
blood as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'pH' as TestID,
ph as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'protein' as TestID,
protein as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'urobilinogen' as TestID,
urobilinogen as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'nitrite' as TestID,
nitrite as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'leukocytes' as TestID,
leucocytes as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
'microscopic' as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
microscopic as ResultComment,
null as CannedMessage,
null as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
uuid as MRN,
uuid, ts
FROM urine

UNION ALL

SELECT
id,
date,
virus as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
result as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
mrn as MRN,
uuid, ts
FROM
(
  select p1.id, p1.date,virus,p1.uuid as MRN,p2.uuid,p2.ts,account,remark,clinremark, result
  FROM virserohead p1
  LEFT JOIN virserores p2 on p1.id=p2.id AND p1.date=p2.date
  WHERE result IS NOT NULL GROUP BY p2.id, p2.date, p2.seq, p2.virus, p2.result
  ) t2
GROUP BY t2.id, t2.date, t2.account

UNION ALL

SELECT
id,
date,
suspvirus as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
result as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
mrn as MRN,
uuid, ts
FROM
(
  select p1.id, p1.date,suspvirus,account,remark,p1.uuid as mrn,p2.uuid, p2.ts,clinremark, result
  FROM virisohead p1
  LEFT JOIN virisores p2 on p1.id=p2.id AND p1.date=p2.date
  WHERE result IS NOT NULL GROUP BY p2.id, p2.date, p2.seq, p2.source, p2.result
  ) t2
GROUP BY t2.id, t2.date, t2.account, t2.suspvirus

UNION ALL

SELECT
id,
date,
p2.code as TestID,
null as QuantitativeResults,
null as QuantitativeUnits,
null as ResultComment,
null as CannedMessage,
'Positive' as Interpretation,
null as ClinRemark,
uuid as SampleId,
null as OrgName,
null as IsoQnt,
null as IsolateComment,
null as DrugName,
null as BloodInt,
mrn as MRN,
uuid, ts
FROM
(
  select p1.id, p1.date,p1.uuid as mrn, p2.uuid, p2.ts, room,account,remark,clinremark, p2.code
  FROM parahead p1
  LEFT JOIN parares p2 on p1.id=p2.id AND p1.date=p2.date
  LEFT JOIN snomed s1 ON s1.code=p2.code
  ) p2
GROUP BY p2.id, p2.date, account


) x


WHERE date IS NOT NULL AND date != '0000-00-00'

