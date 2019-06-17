/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_billing.invoice ADD balanceDue DECIMAL(13,2);
ALTER TABLE ehr_billing.miscCharges ADD investigator varchar(100);