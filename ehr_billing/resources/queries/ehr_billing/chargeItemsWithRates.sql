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