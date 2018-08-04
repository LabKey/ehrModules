--this table contains records of misc charges that have happened that cannot otherwise be
--automatically inferred from the record
CREATE TABLE ehr_billing.miscCharges (
  objectid entityid NOT NULL,
  id varchar(100),
  date timestamp,
  project integer,
  category varchar(100),
  chargeId int,
  quantity double precision,
  unitcost double precision,
  comment varchar(4000),
  chargeType varchar(200),
  billingDate timestamp,
  invoiceId entityid,
  invoicedItemId entityid,
  item varchar(500),
  sourceInvoicedItem entityid,
  creditedaccount varchar(100),
  debitedaccount varchar(200),
  qcstate int,
  parentid entityid,
  issueId int,
  formSort integer,
  chargeCategory VARCHAR(100),

  taskid entityid,
  requestid entityid,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_miscCharges PRIMARY KEY (objectid)
);

--this table contains one row each time a billing run is performed, which gleans items to be charged from a variety of sources
--and snapshots them into invoicedItems
CREATE TABLE ehr_billing.invoiceRuns (
  rowId SERIAL NOT NULL,
  dataSources varchar(1000),
  comment varchar(4000),
  runDate timestamp,
  billingPeriodStart timestamp,
  billingPeriodEnd timestamp,
  objectid entityid NOT NULL,
  invoiceNumber varchar(200),
  status varchar(200),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT pk_invoiceRuns PRIMARY KEY (objectid)
);

--this table contains a snapshot of items actually invoiced, which will draw from many places in the animal record
CREATE TABLE ehr_billing.invoicedItems (
  rowId SERIAL NOT NULL,
  id varchar(100),
  date timestamp,
  debitedaccount varchar(100),
  creditedaccount varchar(100),
  category varchar(100),
  item varchar(500),
  quantity double precision,
  unitcost double precision,
  totalcost double precision,
  chargeId int,
  rateId int,
  exemptionId int,
  comment varchar(4000),
  sourceRecord varchar(200),
  billingId int,
  credit boolean,
  lastName varchar(100),
  firstName varchar(100),
  project int,
  invoiceDate timestamp,
  invoiceNumber int,
  transactionType varchar(10),
  department varchar(100),
  mailcode varchar(20),
  contactPhone varchar(30),
  faid int,
  cageId int,
  objectId entityid NOT NULL,
  itemCode varchar(100),
  creditAccountId int,
  invoiceId entityid,
  servicecenter varchar(200),
  transactionNumber varchar(100),
  investigatorId int,
  chargeCategory varchar(100),
  sourcerecord2 varchar(100),
  issueId int,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_invoicedItems PRIMARY KEY (objectid)
);