CREATE TABLE ehr.status
(
  rowid SERIAL NOT NULL,
  label varchar(200) NOT NULL,
  description varchar(4000),
  publicdata boolean DEFAULT false,
  draftdata boolean DEFAULT false,
  isdeleted boolean DEFAULT false,
  isrequest boolean DEFAULT false,
  allowfuturedates boolean DEFAULT false,
  CONSTRAINT pk_status PRIMARY KEY (rowid)
);

INSERT INTO ehr.status (rowid, label, description, publicdata, draftdata, isdeleted, isrequest, allowfuturedates)

(select q.rowid, q.label, q.description, q.publicdata, m.draftdata, m.isdeleted, m.isrequest, m.allowfuturedates
from study.qcstate q left join ehr.qcstatemetadata m on q.label = m.QCStateLabel);

--drop table ehr.qcstatemetadata;