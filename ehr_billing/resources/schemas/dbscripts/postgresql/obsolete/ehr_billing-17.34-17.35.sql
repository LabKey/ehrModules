/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
ALTER TABLE ehr_billing.chargeRateExemptions ALTER remark TYPE TEXT;

ALTER TABLE ehr_billing.chargeRateExemptions ADD CONSTRAINT FK_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_CHARGE_RATE_EXEMPTIONS_CONTAINER_INDEX ON ehr_billing.chargeRateExemptions (Container);

ALTER TABLE ehr_billing.chargeUnits ADD CONSTRAINT FK_EHR_BILLING_CHARGE_UNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_CHARGE_UNITS_CONTAINER_INDEX ON ehr_billing.chargeUnits (Container);

ALTER TABLE ehr_billing.invoiceRuns ADD CONSTRAINT FK_EHR_BILLING_INVOICE_RUNS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX ON ehr_billing.invoiceRuns (Container);

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX ON ehr_billing.invoicedItems (Container);

ALTER TABLE ehr_billing.miscCharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX ON ehr_billing.miscCharges (Container);