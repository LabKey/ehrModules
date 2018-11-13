/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
ALTER TABLE ehr_billing.chargeRates ALTER COLUMN unitCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceAmount DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentAmountReceived DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN unitCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN totalCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN unitCost DECIMAL(13,2);
GO