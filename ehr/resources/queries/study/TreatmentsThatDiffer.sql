/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
d.date,
d.id.curlocation.area as CurrentArea,
d.id.curlocation.room as CurrentRoom,
d.id.curlocation.cage as CurrentCage,

t.lsid,
t.id,
t.code,
t.qualifier,
t.route,
t.code.meaning as meaning,
t.volume, t.vol_units,
t.amount, t.amount_units,
t.concentration, t.conc_units,
t.dosage, t.dosage_units,
t.performedby,

d.id as drug_id,
d.code as drug_code,
d.qualifier as drug_qualifier,
d.route as drug_route,
d.code.meaning as drug_meaning,
d.volume as drug_volume, d.vol_units as drug_vol_units,
d.amount as drug_amount, d.amount_units as drug_amount_units,
d.concentration as drug_concentration, t.conc_units as drug_conc_units,
d.dosage as drug_dosage, d.dosage_units as drug_dosage_units,
d.performedby as drug_performedby,

FROM study."Drug Administration" d
LEFT JOIN study.treatmentSchedule t
ON (d.parentid is not null AND t.primaryKey = d.parentid)

WHERE

t.id != d.id OR
t.code != d.code OR
t.volume != d.volume OR
t.vol_units != d.vol_units OR
t.amount != d.amount OR
t.amount_units != d.amount_units OR
t.dosage != d.dosage OR
t.dosage_units != d.dosage_units OR
t.concentration != d.concentration OR
t.conc_units != d.conc_units OR
t.route != d.route
