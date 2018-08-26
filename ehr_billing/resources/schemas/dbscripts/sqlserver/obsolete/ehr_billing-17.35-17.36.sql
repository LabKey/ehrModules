CREATE TABLE ehr_billing.invoice (

  rowid INT IDENTITY(1,1) NOT NULL,
  invoiceNumber int,
  invoiceRunId ENTITYID,
  accountNumber nvarchar(10),
  invoiceSentOn datetime,
  invoiceAmount double precision,
  invoiceSentComment nvarchar(10),
  paymentAmountReceived double precision,
  fullPaymentReceived bit default 0,
  paymentReceivedOn datetime,
  paymentReceivedComment nvarchar(10),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created datetime,
  modifiedBy USERID,
  modified datetime,

  CONSTRAINT PK_EHR_BILLING_INVOICE PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_INVOICE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_INVOICE_CONTAINER_INDEX ON ehr_billing.invoice (Container);
GO

ALTER TABLE ehr_billing.invoiceRuns DROP COLUMN invoiceNumber;
GO