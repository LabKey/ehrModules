CREATE TABLE ehr_billing.invoice (

  rowId SERIAL NOT NULL,
  invoiceNumber integer,
  invoiceRunId ENTITYID,
  accountNumber varchar(10),
  invoiceSentOn timestamp,
  invoiceAmount double precision,
  invoiceSentComment varchar(10),
  paymentAmountReceived double precision,
  fullPaymentReceived boolean,
  paymentReceivedOn timestamp,
  paymentReceivedComment varchar(10),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_EHR_BILLING_INVOICE PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_INVOICE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_INVOICE_CONTAINER_INDEX ON ehr_billing.invoice (Container);

ALTER TABLE ehr_billing.invoiceRuns DROP invoiceNumber;