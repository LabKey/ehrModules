/*
 * Copyright (c) 2024-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
    cr.chargeId,
    ci.name AS item,
    ci.chargeCategoryId.name AS category,
    ci.departmentCode,
    ci.startDate AS chargeableItemStartDate,
    ci.endDate AS chargeableItemEndDate,
    cr.unitCost,
    cr.startDate AS chargeRateStartDate,
    cr.endDate AS chargeRateEndDate
FROM ehr_billing.chargeableItems ci
         FULL OUTER JOIN ehr_billing.chargeRates cr
                         ON ci.rowid = cr.chargeId