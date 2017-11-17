--this table contains records of misc charges that have happened that cannot otherwise be
--automatically inferred from the record
CREATE TABLE ehr_billing.miscCharges (
  objectid entityid NOT NULL,
  id nvarchar(100),
  date DATETIME,
  project integer,
  category nvarchar(100),
  chargeId int,
  quantity double precision,
  unitcost double precision,
  comment nvarchar(4000),
  chargeType nvarchar(200),
  billingDate DATETIME,
  invoiceId entityid,
  invoicedItemId entityid,
  item nvarchar(500),
  sourceInvoicedItem entityid,
  creditedaccount nvarchar(100),
  debitedaccount nvarchar(200),
  qcstate int,
  parentid entityid,
  issueId int,
  formSort integer,
  chargeCategory nvarchar(100),
  
  taskid entityid,
  requestid entityid,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_miscCharges PRIMARY KEY (objectid)
);

--this table contains one row each time a billing run is performed, which gleans items to be charged from a variety of sources
--and snapshots them into invoicedItems
CREATE TABLE ehr_billing.invoiceRuns (
  rowId INT IDENTITY(1,1) NOT NULL,
  dataSources nvarchar(1000),
  comment nvarchar(4000),
  runDate DATETIME,
  billingPeriodStart DATETIME,
  billingPeriodEnd DATETIME,
  objectid entityid NOT NULL,
  invoiceNumber nvarchar(200),
  status nvarchar(200),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_invoiceRuns PRIMARY KEY (objectid)
);

--this table contains a snapshot of items actually invoiced, which will draw from many places in the animal record
CREATE TABLE ehr_billing.invoicedItems (
  rowId INT IDENTITY(1,1) NOT NULL,
  id nvarchar(100),
  date DATETIME,
  debitedaccount nvarchar(100),
  creditedaccount nvarchar(100),
  category nvarchar(100),
  item nvarchar(500),
  quantity double precision,
  unitcost double precision,
  totalcost double precision,
  chargeId int,
  rateId int,
  exemptionId int,
  comment nvarchar(4000),
  sourceRecord nvarchar(200),
  billingId int,
  credit bit,
  lastName nvarchar(100),
  firstName nvarchar(100),
  project int,
  invoiceDate DATETIME,
  invoiceNumber int,
  transactionType nvarchar(10),
  department nvarchar(100),
  mailcode nvarchar(20),
  contactPhone nvarchar(30),
  faid int,
  cageId int,
  objectId entityid NOT NULL,
  itemCode nvarchar(100),
  creditAccountId int,
  invoiceId entityid,
  servicecenter nvarchar(200),
  transactionNumber nvarchar(100),
  investigatorId int,
  chargeCategory nvarchar(100),
  sourcerecord2 nvarchar(100),
  issueId int,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_invoicedItems PRIMARY KEY (objectid)
);