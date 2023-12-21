select
    jj.employeeid as employeeid,
    coalesce(jj.requirementname, '') as requirementname
from ehr_compliancedb.employeeTraining  jj where
        jj.employeeid in (select ss.employeeid from ehr_compliancedb.Employees ss where ss.MajorUDDS = 'OPS - ASB')

group by  jj.employeeid, jj.Requirementname
    PIVOT   requirementname by employeeid