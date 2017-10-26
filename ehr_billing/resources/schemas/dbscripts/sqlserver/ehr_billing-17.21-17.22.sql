/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_billing.aliases ADD COLUMN LSID LSIDtype;
ALTER TABLE ehr_billing.chargeRates ADD COLUMN LSID LSIDtype;